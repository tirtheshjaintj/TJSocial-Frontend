import { motion } from "framer-motion";
import { BiGhost } from "react-icons/bi";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
    return (
        <div className="flex items-center mt-36 justify-center transition-colors duration-500">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center px-6"
            >
                <motion.div
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    className="flex justify-center text-zinc-800 dark:text-white"
                >
                    <BiGhost className="text-[8rem] md:text-[10rem]" />
                </motion.div>

                <h1 className="text-5xl md:text-6xl font-bold text-zinc-800 dark:text-white mt-4">
                    404
                </h1>
                <p className="text-lg md:text-xl mt-2 text-zinc-600 dark:text-zinc-400">
                    Oops! The page you are looking for doesn’t exist.
                </p>
                <Link
                    to="/"
                    className="inline-block mt-6 px-6 py-3 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:scale-105 transition-transform duration-300"
                >
                    Go back home
                </Link>
            </motion.div>
        </div>
    );
}
