import type { NextFunction, Request, Response } from 'express'

import { supabase } from '../lib/supabase.client.js'

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  if (!supabase) {
    res.status(500).json({ error: 'Supabase service credentials are not configured.' })
    return
  }

  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data.user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  req.user = data.user
  next()
}
