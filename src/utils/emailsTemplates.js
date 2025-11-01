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

const generateWelcomeEmail = (firstName) => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">¡Bienvenido a Cool Invitation!</h1>
      </div>
      
      <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 10px 10px;">
        <p>Hola <strong>${firstName}</strong>,</p>
        
        <p>¡Estamos emocionados de tenerte en nuestra comunidad! Ahora estás a pocos pasos de crear invitaciones digitales increíbles para tus eventos.</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
          <h3 style="color: #667eea; margin-top: 0;">Sigue estos pasos para comenzar:</h3>
          <ol style="line-height: 2;">
            <li><strong>Inicia sesión</strong> en tu cuenta con tus credenciales</li>
            <li><strong>Registra un nuevo evento</strong> (bodas, cumpleaños, eventos corporativos, etc.)</li>
            <li><strong>Nos contactamos contigo</strong> para diseñar tu invitación digital personalizada</li>
            <li><strong>Registra a tus invitados</strong> en el sistema</li>
            <li><strong>Envía tus invitaciones cool</strong> por WhatsApp o email</li>
          </ol>
        </div>

        <p>Con Cool Invitation podrás:</p>
        <ul style="line-height: 2;">
          <li>✅ Confirmaciones de asistencia en tiempo real</li>
          <li>✅ Ubicación del evento con enlaces a Maps</li>
          <li>✅ Cuenta regresiva automática</li>
          <li>✅ Notificaciones y recordatorios</li>
          <li>✅ Calendarización automática</li>
        </ul>

        <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.</p>
        
        <p>¡Prepárate para impresionar a tus invitados!</p>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="#" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Comenzar Ahora</a>
        </div>
      </div>
      
      <div style="text-align: center; padding: 20px; color: #777; font-size: 12px;">
        <p>© 2024 Cool Invitation. Todos los derechos reservados.</p>
      </div>
    </div>
  `;
};

module.exports = { sendTokenToRegistrationEmail, generateWelcomeEmail };
