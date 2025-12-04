export const otpText = (code) => {
   const text = `Your OTP code is ${code}. It is valid for 5 minutes. If you did not request this, please ignore this message.`;
   const subject = "Your Naeewala OTP";
   return { subject, text };
}