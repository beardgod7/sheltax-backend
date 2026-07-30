export function convertToCSV(data: any[], headers: string[]): string {
  if (!data || data.length === 0) {
    return '';
  }

  const csvHeaders = headers.join(',');
  const csvRows = data.map((row) => {
    return headers
      .map((header) => {
        const value = row[header];
        if (value === null || value === undefined) return '';

        if (typeof value === 'object') {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        }

        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }

        return stringValue;
      })
      .join(',');
  });

  return [csvHeaders, ...csvRows].join('\n');
}

export function exportAttendeesToCSV(bookings: any[]): string {
  const headers = [
    'id',
    'FirstName',
    'LastName',
    'Email',
    'PhoneNumber',
    'registrationType',
    'attendanceStatus',
    'metadata',
    'createdAt',
  ];

  const formattedData = bookings.map((booking) => ({
    id: booking.id,
    FirstName: booking.FirstName || '',
    LastName: booking.LastName || '',
    Email: booking.Email || '',
    PhoneNumber: booking.PhoneNumber || '',
    registrationType: booking.registrationType || '',
    attendanceStatus: booking.attendanceStatus || '',
    metadata: booking.metadata || {},
    createdAt: booking.createdAt || '',
  }));

  return convertToCSV(formattedData, headers);
}

export function exportTourBookingsToCSV(bookings: any[]): string {
  const headers = [
    'id',
    'fullName',
    'email',
    'phoneNumber',
    'selectedDate',
    'numberOfTickets',
    'totalAmount',
    'paymentStatus',
    'ticketId',
    'bookingStatus',
    'createdAt',
  ];

  const formattedData = bookings.map((booking) => ({
    id: booking.id,
    fullName: booking.fullName || '',
    email: booking.email || '',
    phoneNumber: booking.phoneNumber || '',
    selectedDate: booking.selectedDate || '',
    numberOfTickets: booking.numberOfTickets || 0,
    totalAmount: booking.totalAmount || 0,
    paymentStatus: booking.paymentStatus || '',
    ticketId: booking.ticketId || '',
    bookingStatus: booking.bookingStatus || '',
    createdAt: booking.createdAt || '',
  }));

  return convertToCSV(formattedData, headers);
}

export function exportTripBookingsToCSV(bookings: any[]): string {
  const headers = [
    'id',
    'fullName',
    'email',
    'phoneNumber',
    'numberOfTickets',
    'totalAmount',
    'paymentStatus',
    'ticketId',
    'bookingStatus',
    'createdAt',
  ];

  const formattedData = bookings.map((booking) => ({
    id: booking.id,
    fullName: booking.fullName || '',
    email: booking.email || '',
    phoneNumber: booking.phoneNumber || '',
    numberOfTickets: booking.numberOfTickets || 0,
    totalAmount: booking.totalAmount || 0,
    paymentStatus: booking.paymentStatus || '',
    ticketId: booking.ticketId || '',
    bookingStatus: booking.bookingStatus || '',
    createdAt: booking.createdAt || '',
  }));

  return convertToCSV(formattedData, headers);
}

export function exportFilmBookingsToCSV(bookings: any[]): string {
  const headers = [
    'id',
    'filmTitle',
    'fullName',
    'email',
    'phoneNumber',
    'screeningDate',
    'startTime',
    'numberOfSeats',
    'totalAmount',
    'paymentStatus',
    'ticketId',
    'bookingStatus',
    'createdAt',
  ];

  const formattedData = bookings.map((booking) => ({
    id: booking.id,
    filmTitle: booking.Film?.title || '',
    fullName: booking.fullName || '',
    email: booking.email || '',
    phoneNumber: booking.phoneNumber || '',
    screeningDate: booking.ScreeningSlot?.screeningDate || '',
    startTime: booking.ScreeningSlot?.startTime || '',
    numberOfSeats: booking.numberOfSeats || 0,
    totalAmount: booking.totalAmount || 0,
    paymentStatus: booking.paymentStatus || '',
    ticketId: booking.ticketId || '',
    bookingStatus: booking.bookingStatus || '',
    createdAt: booking.createdAt || '',
  }));

  return convertToCSV(formattedData, headers);
}
