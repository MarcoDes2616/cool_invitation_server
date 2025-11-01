const sendTokenToRegistrationEmail = (token) => {
  return `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Registro Temporal</h2>
        <p>Utiliza el siguiente código para completar tu registro:</p>
        <div style="background: #f4f4f4; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
          <strong style="font-size: 24px; letter-spacing: 3px; color: #000; font-weight: bold;">${token}</strong>
        </div>
        <p>Este código es válido por <strong>30 minutos</strong>.</p>
        <p style="font-size: 12px; color: #777;">Si no solicitaste este registro, por favor ignora este mensaje.</p>
      </div>
    `;
};

module.exports = { sendTokenToRegistrationEmail };
