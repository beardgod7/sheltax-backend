import { Request, Response, NextFunction } from 'express';

export async function checkRegistrationOpen(req: Request & { event?: any }, res: Response, next: NextFunction): Promise<void> {
  try {
    const { EventId } = req.body;

    if (!EventId) {
      res.status(400).json({ message: 'Event ID is required' });
      return;
    }

    // Dynamic import to break circular dependency if feature is converted later
    const { Events } = await import('../features/Events/model');

    const event: any = await Events.findByPk(EventId);

    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }

    if (!event.isPublished) {
      res.status(400).json({ 
        message: 'Event is not available for registration' 
      });
      return;
    }

    if (!event.registrationEnabled) {
      res.status(400).json({ 
        message: 'Registration is closed for this event' 
      });
      return;
    }

    if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
      res.status(400).json({ 
        message: 'Registration deadline has passed' 
      });
      return;
    }

    req.event = event;
    next();
  } catch (error) {
    console.error('Error in checkRegistrationOpen:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
