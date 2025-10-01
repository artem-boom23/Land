import { motion } from "framer-motion";
import { useState } from "react";
import BookingForm from "./BookingForm";

export default function PropertyForm({ plotId }) {
  const [submitted, setSubmitted] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="bg-white shadow-lg rounded-2xl p-6"
    >
      <h3 className="text-2xl font-bold text-gray-900 mb-4">
        Оставить заявку
      </h3>

      {submitted ? (
        <p className="text-green-600 font-semibold text-center">
          Спасибо! Ваша заявка отправлена. Мы скоро свяжемся с вами!
        </p>
      ) : (
        <BookingForm
          plotId={plotId}
          submitText="Отправить заявку"
          onValidSubmit={() => {
            // здесь будет реальная отправка (Telegram/email/CRM)
            setSubmitted(true);
          }}
        />
      )}
    </motion.div>
  );
}
