
const nodemailer = require("nodemailer");

const sendPoliceNotification = async (station, alert) => {
  console.log(
    `🚨 New SOS Alert sent to ${station.name} for user ${alert.userSnapshot.fullName}`
  );

  if (station.email) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.ALERT_EMAIL,
        pass: process.env.ALERT_EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.ALERT_EMAIL,
      to: station.email,
      subject: "🚨 SOS Alert Received",
      text: `
New SOS alert from ${alert.userSnapshot.fullName}
Phone: ${alert.userSnapshot.phone}
Message: ${alert.evidence.message}

Location: https://www.google.com/maps?q=${alert.location.coordinates[1]},${alert.location.coordinates[0]}
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email notification sent to police");
  }
};

module.exports = sendPoliceNotification;
