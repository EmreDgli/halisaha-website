-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_statistics ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all profiles" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Enable insert for authenticated users during registration" ON public.users FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Teams policies
CREATE POLICY "Anyone can view teams" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Team managers can update their teams" ON public.teams FOR UPDATE USING (auth.uid() = manager_id);
CREATE POLICY "Authenticated users can create teams" ON public.teams FOR INSERT WITH CHECK (auth.uid() = manager_id);

-- Team members policies
CREATE POLICY "Anyone can view team members" ON public.team_members FOR SELECT USING (true);
CREATE POLICY "Team managers can manage members" ON public.team_members FOR ALL USING (
  EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND manager_id = auth.uid())
);
CREATE POLICY "Users can leave teams" ON public.team_members FOR DELETE USING (auth.uid() = user_id);

-- Team join requests policies
CREATE POLICY "Team managers can view requests for their teams" ON public.team_join_requests FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND manager_id = auth.uid())
  OR auth.uid() = user_id
);
CREATE POLICY "Users can create join requests" ON public.team_join_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Team managers can update requests" ON public.team_join_requests FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND manager_id = auth.uid())
);

-- Fields policies
CREATE POLICY "Anyone can view fields" ON public.fields FOR SELECT USING (true);
CREATE POLICY "Field owners can manage their fields" ON public.fields FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Field owners can create fields" ON public.fields FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Matches policies
CREATE POLICY "Anyone can view matches" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Team managers can create matches" ON public.matches FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.teams WHERE id = organizer_team_id AND manager_id = auth.uid())
);
CREATE POLICY "Team managers can update their matches" ON public.matches FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.teams WHERE id = organizer_team_id AND manager_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.teams WHERE id = opponent_team_id AND manager_id = auth.uid())
);

-- Match join requests policies
CREATE POLICY "Team managers can view match requests" ON public.match_join_requests FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND manager_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.matches m JOIN public.teams t ON m.organizer_team_id = t.id WHERE m.id = match_id AND t.manager_id = auth.uid())
);
CREATE POLICY "Team managers can create match requests" ON public.match_join_requests FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND manager_id = auth.uid())
);
CREATE POLICY "Match organizers can update requests" ON public.match_join_requests FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.matches m JOIN public.teams t ON m.organizer_team_id = t.id WHERE m.id = match_id AND t.manager_id = auth.uid())
);

-- Match participants policies
CREATE POLICY "Anyone can view match participants" ON public.match_participants FOR SELECT USING (true);
CREATE POLICY "Team managers can manage participants" ON public.match_participants FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.matches m 
    JOIN public.teams t1 ON m.organizer_team_id = t1.id 
    LEFT JOIN public.teams t2 ON m.opponent_team_id = t2.id 
    WHERE m.id = match_id AND (t1.manager_id = auth.uid() OR t2.manager_id = auth.uid())
  )
);

-- Payments policies
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create payments" ON public.payments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Field ratings policies
CREATE POLICY "Anyone can view field ratings" ON public.field_ratings FOR SELECT USING (true);
CREATE POLICY "Users can create ratings" ON public.field_ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ratings" ON public.field_ratings FOR UPDATE USING (auth.uid() = user_id);

-- Match videos policies
CREATE POLICY "Anyone can view public videos" ON public.match_videos FOR SELECT USING (is_public = true);
CREATE POLICY "Users can view own videos" ON public.match_videos FOR SELECT USING (auth.uid() = uploader_id);
CREATE POLICY "Users can upload videos" ON public.match_videos FOR INSERT WITH CHECK (auth.uid() = uploader_id);
CREATE POLICY "Users can update own videos" ON public.match_videos FOR UPDATE USING (auth.uid() = uploader_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Match statistics policies
CREATE POLICY "Anyone can view match statistics" ON public.match_statistics FOR SELECT USING (true);
CREATE POLICY "Team managers can manage statistics" ON public.match_statistics FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.matches m 
    JOIN public.teams t1 ON m.organizer_team_id = t1.id 
    LEFT JOIN public.teams t2 ON m.opponent_team_id = t2.id 
    WHERE m.id = match_id AND (t1.manager_id = auth.uid() OR t2.manager_id = auth.uid())
  )
);
