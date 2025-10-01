import { motion, AnimatePresence } from "framer-motion";

export default function ResetMapButton({ show, onClick }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          key="reset-map-button"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          onClick={onClick}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "#16a34a",
            color: "white",
            padding: "10px 16px",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: "pointer",
            userSelect: "none",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#15803d")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#16a34a")}
        >
          ↺ Участки
        </motion.button>
      )}
    </AnimatePresence>
  );
}
