// src/components/Contact.jsx
import { motion } from "framer-motion";
import BookingForm from "./BookingForm";

export default function Contact() {
  return (
    <section id="contact" className="py-16 sm:py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-900 mb-8">
          Свяжитесь с нами
        </h2>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-6 sm:p-8"
        >
          <BookingForm source="contact" submitText="Отправить заявку" />
        </motion.div>
      </div>
    </section>
  );
}
