-- Function to handle user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update field rating
CREATE OR REPLACE FUNCTION public.update_field_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.fields 
  SET 
    rating = (
      SELECT AVG(rating)::DECIMAL(3,2) 
      FROM public.field_ratings 
      WHERE field_id = NEW.field_id
    ),
    total_ratings = (
      SELECT COUNT(*) 
      FROM public.field_ratings 
      WHERE field_id = NEW.field_id
    )
  WHERE id = NEW.field_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for field rating updates
CREATE TRIGGER on_field_rating_change
  AFTER INSERT OR UPDATE ON public.field_ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_field_rating();

-- Function to create notification
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT,
  p_related_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, related_id)
  VALUES (p_user_id, p_title, p_message, p_type, p_related_id)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user teams
CREATE OR REPLACE FUNCTION public.get_user_teams(p_user_id UUID)
RETURNS TABLE (
  team_id UUID,
  team_name TEXT,
  role TEXT,
  member_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id as team_id,
    t.name as team_name,
    CASE 
      WHEN t.manager_id = p_user_id THEN 'manager'
      ELSE 'member'
    END as role,
    (SELECT COUNT(*) FROM public.team_members WHERE team_id = t.id) as member_count
  FROM public.teams t
  LEFT JOIN public.team_members tm ON t.id = tm.team_id
  WHERE t.manager_id = p_user_id OR tm.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get match statistics
CREATE OR REPLACE FUNCTION public.get_match_statistics(p_match_id UUID)
RETURNS TABLE (
  user_id UUID,
  full_name TEXT,
  goals INTEGER,
  assists INTEGER,
  yellow_cards INTEGER,
  red_cards INTEGER,
  minutes_played INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ms.user_id,
    u.full_name,
    ms.goals,
    ms.assists,
    ms.yellow_cards,
    ms.red_cards,
    ms.minutes_played
  FROM public.match_statistics ms
  JOIN public.users u ON ms.user_id = u.id
  WHERE ms.match_id = p_match_id
  ORDER BY ms.goals DESC, ms.assists DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment video views
CREATE OR REPLACE FUNCTION public.increment_video_views(p_video_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.match_videos 
  SET views = views + 1 
  WHERE id = p_video_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
