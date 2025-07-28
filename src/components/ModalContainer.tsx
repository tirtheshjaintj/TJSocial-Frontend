import { type ReactElement } from 'react'
import { AnimatePresence, motion } from "framer-motion";

interface ModalContainerProps {
    onClose: () => void;
    open_status: boolean;
    children: ReactElement;
}

function ModalContainer({ onClose, open_status, children }: ModalContainerProps) {
    return (
        <AnimatePresence>

            {open_status && <motion.div
                className="fixed inset-0 z-20 bg-white dark:bg-gray-900 md:dark:bg-black/40  md:bg-black/40 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                {/* Backdrop */}
                <motion.div
                    className="absolute -z-10 inset-0 cursor-pointer"
                    onClick={onClose}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                />

                {children}
            </motion.div >
            }
        </AnimatePresence >

    )
}

export default ModalContainer