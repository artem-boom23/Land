// src/components/BookingModal.jsx
import { motion, AnimatePresence } from "framer-motion";
import BookingForm from "./BookingForm";

export default function BookingModal({ plotId, onClose, source = "modal" }) {
  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center px-2">
        <motion.div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg sm:max-w-md p-6">
          <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl sm:text-xl">✕</button>
          <h2 className="text-xl sm:text-2xl font-bold text-green-700 mb-4 text-center">
            Заявка на участок {plotId ? `№ ${plotId}` : ""}
          </h2>
          <BookingForm source={source} plotId={plotId} submitText="Отправить заявку" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

