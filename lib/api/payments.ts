"use client"

import { supabase } from "../supabase"

// Create payment (mock implementation for testing)
export async function createPayment(paymentData: {
  match_id?: string
  amount: number
  payment_method: string
  currency?: string
}) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("User not authenticated")

    // Mock payment processing
    const mockTransactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock success/failure (90% success rate)
    const isSuccess = Math.random() > 0.1

    const { data, error } = await supabase
      .from("payments")
      .insert({
        user_id: user.id,
        match_id: paymentData.match_id,
        amount: paymentData.amount,
        currency: paymentData.currency || "TRY",
        payment_method: paymentData.payment_method,
        transaction_id: mockTransactionId,
        status: isSuccess ? "completed" : "failed",
      })
      .select()
      .single()

    if (error) throw error

    // Create notification
    await supabase.rpc("create_notification", {
      p_user_id: user.id,
      p_title: isSuccess ? "Ödeme Başarılı" : "Ödeme Başarısız",
      p_message: isSuccess
        ? `${paymentData.amount} ${paymentData.currency || "TRY"} ödemeniz başarıyla tamamlandı`
        : "Ödeme işleminiz başarısız oldu. Lütfen tekrar deneyin.",
      p_type: "payment",
      p_related_id: data.id,
    })

    return { data, error: null, success: isSuccess }
  } catch (error) {
    return { data: null, error, success: false }
  }
}

// Get user payments
export async function getUserPayments() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("User not authenticated")

    const { data, error } = await supabase
      .from("payments")
      .select(`
        *,
        match:matches(title, match_date, field:fields(name))
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Get payment details
export async function getPaymentDetails(paymentId: string) {
  try {
    const { data, error } = await supabase
      .from("payments")
      .select(`
        *,
        user:users(full_name, email),
        match:matches(
          title, match_date,
          field:fields(name, address),
          organizer_team:teams!matches_organizer_team_id_fkey(name),
          opponent_team:teams!matches_opponent_team_id_fkey(name)
        )
      `)
      .eq("id", paymentId)
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Refund payment (admin function)
export async function refundPayment(paymentId: string, reason?: string) {
  try {
    const { data, error } = await supabase
      .from("payments")
      .update({
        status: "refunded",
        updated_at: new Date().toISOString(),
      })
      .eq("id", paymentId)
      .select(`
        *,
        user:users(full_name)
      `)
      .single()

    if (error) throw error

    // Notify user about refund
    await supabase.rpc("create_notification", {
      p_user_id: data.user_id,
      p_title: "Ödeme İade Edildi",
      p_message: `${data.amount} ${data.currency} tutarındaki ödemeniz iade edildi. ${reason || ""}`,
      p_type: "payment_refund",
      p_related_id: data.id,
    })

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Frontend usage examples:
/*
// Create payment
const payment = await createPayment({
  match_id: 'match-uuid',
  amount: 50,
  payment_method: 'credit_card',
  currency: 'TRY'
})

// Get user payments
const payments = await getUserPayments()

// Get payment details
const paymentDetails = await getPaymentDetails('payment-uuid')

// Usage in React component:
import { createPayment, getUserPayments } from '@/lib/api/payments'

const PaymentPage = () => {
  const [isLoading, setIsLoading] = useState(false)
  
  const handlePayment = async (paymentData) => {
    setIsLoading(true)
    const { data, error, success } = await createPayment(paymentData)
    
    if (success) {
      alert('Ödeme başarılı!')
      router.push('/payment/success')
    } else {
      alert('Ödeme başarısız!')
    }
    setIsLoading(false)
  }
  
  return (
    // JSX here
  )
}
*/
