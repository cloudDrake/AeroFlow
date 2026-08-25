import type { Response } from 'express'

export abstract class BaseController {
  protected unauthorized(res: Response, message = 'Unauthorized') {
    res.status(401).json({ error: message })
  }

  protected badRequest(res: Response, message = 'Bad Request') {
    res.status(400).json({ error: message })
  }

  protected serverError(
    res: Response,
    error: unknown,
    context: string,
    message = 'Internal Server Error'
  ) {
    console.error(`${context} error`, error)
    res.status(500).json({ error: message })
  }
}
