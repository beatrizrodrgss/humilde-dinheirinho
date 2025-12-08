import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { formatCurrency } from "@/lib/utils";

interface CountUpProps {
    value: number;
    className?: string;
    prefix?: string;
}

export function CountUp({ value, className, prefix = "" }: CountUpProps) {
    const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
    const display = useTransform(spring, (current) =>
        formatCurrency(current)
    );

    useEffect(() => {
        spring.set(value);
    }, [value, spring]);

    return <motion.span className={className}>{display}</motion.span>;
}
