import { motion } from "framer-motion";
import React from "react";

type SubMenuMotionProps = {
  open: boolean;
  children: React.ReactNode;
};

export default function SubMenuMotion({ open, children }: SubMenuMotionProps) {
  return (
    <motion.ul
      initial={false}
      animate={open ? "open" : "collapsed"}
      variants={{
        open: { height: "auto", opacity: 1 },
        collapsed: { height: 0, opacity: 0 },
      }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      style={{ overflow: "hidden", display: "block" }}
    >
      {children}
    </motion.ul>
  );
}
