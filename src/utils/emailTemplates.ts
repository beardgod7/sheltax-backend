export function getRegistrationConfirmationTemplate(eventDetails: any, bookingDetails: any) {
  const { Title, Date: eventDate, Location, eventType, Organizer } = eventDetails;
  const { FirstName, LastName, registrationType } = bookingDetails;

  const registrationTypeText =
    registrationType === 'Volunteer'
      ? 'volunteer registration'
      : registrationType === 'Sponsor'
      ? 'sponsorship registration'
      : 'registration';

  return {
    subject: `Registration Confirmed: ${Title}`,
    text: `
Hello ${FirstName} ${LastName},

Thank you for your ${registrationTypeText} for ${Title}!

Event Details:
- Event: ${Title}
- Organizer: ${Organizer || 'N/A'}
- Date: ${Array.isArray(eventDate) ? eventDate.join(', ') : eventDate || 'TBA'}
- Location: ${Array.isArray(Location) ? Location.join(', ') : Location}
- Type: ${eventType}

We look forward to seeing you at the event!

Best regards,
${Organizer || 'Event Team'}
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9f9f9; }
    .details { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #4CAF50; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Registration Confirmed!</h1>
    </div>
    <div class="content">
      <p>Hello <strong>${FirstName} ${LastName}</strong>,</p>
      <p>Thank you for your <strong>${registrationTypeText}</strong> for <strong>${Title}</strong>!</p>
      
      <div class="details">
        <h3>Event Details:</h3>
        <p><strong>Event:</strong> ${Title}</p>
        <p><strong>Organizer:</strong> ${Organizer || 'N/A'}</p>
        <p><strong>Date:</strong> ${Array.isArray(eventDate) ? eventDate.join(', ') : eventDate || 'TBA'}</p>
        <p><strong>Location:</strong> ${Array.isArray(Location) ? Location.join(', ') : Location}</p>
        <p><strong>Type:</strong> ${eventType}</p>
      </div>
      
      <p>We look forward to seeing you at the event!</p>
    </div>
    <div class="footer">
      <p>Best regards,<br>${Organizer || 'Event Team'}</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
  };
}

export function getBroadcastTemplate(eventTitle: string, subject: string, message: string, organizer?: string) {
  return {
    subject: `${eventTitle}: ${subject}`,
    text: `
${message}

---
This message is regarding: ${eventTitle}
From: ${organizer || 'Event Team'}
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9f9f9; }
    .message { background-color: white; padding: 20px; margin: 15px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #ddd; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${eventTitle}</h1>
    </div>
    <div class="content">
      <h2>${subject}</h2>
      <div class="message">
        <p>${message.replace(/\n/g, '<br>')}</p>
      </div>
    </div>
    <div class="footer">
      <p>Sent by <strong>${organizer || 'Event Team'}</strong> regarding ${eventTitle}</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
  };
}

export function getEventUpdateTemplate(eventTitle: string, updateMessage: string, organizer?: string) {
  return getBroadcastTemplate(eventTitle, 'Event Update', updateMessage, organizer);
}

export function getVolunteerConfirmationTemplate(eventDetails: any, bookingDetails: any) {
  return getRegistrationConfirmationTemplate(eventDetails, { ...bookingDetails, registrationType: 'Volunteer' });
}

export function getTourConfirmationTemplate(tourDetails: any, bookingDetails: any) {
  const { title, selectedDate, ticketId } = tourDetails;
  const { fullName } = bookingDetails;
  return {
    subject: `Tour Confirmed: ${title}`,
    text: `Hello ${fullName}, your tour "${title}" on ${selectedDate} is confirmed. Ticket ID: ${ticketId}`,
    html: `<p>Hello ${fullName}, your tour <strong>${title}</strong> on <strong>${selectedDate}</strong> is confirmed. Ticket ID: <strong>${ticketId}</strong>.</p>`,
  };
}

export function getTripConfirmationTemplate(tripDetails: any, bookingDetails: any) {
  const { title, ticketId } = tripDetails;
  const { fullName } = bookingDetails;
  return {
    subject: `Trip Confirmed: ${title}`,
    text: `Hello ${fullName}, your trip "${title}" is confirmed. Ticket ID: ${ticketId}`,
    html: `<p>Hello ${fullName}, your trip <strong>${title}</strong> is confirmed. Ticket ID: <strong>${ticketId}</strong>.</p>`,
  };
}
