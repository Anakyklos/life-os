
import React, { useRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";
import { cn } from "@/shared/lib/cn";
import { Link } from "react-router-dom";

export interface DockProps extends VariantProps<typeof dockVariants> {
    className?: string;
    magnification?: number;
    distance?: number;
    direction?: "top" | "middle" | "bottom";
    children: React.ReactNode;
}

const dockVariants = cva(
    "mx-auto w-max h-max p-2 flex gap-2 rounded-2xl border supports-backdrop-blur:bg-white/10 supports-backdrop-blur:dark:bg-black/10 backdrop-blur-md",
);

const Dock = React.forwardRef<HTMLDivElement, DockProps>(
    (
        {
            className,
            children,
            magnification = 60,
            distance = 140,
            direction = "bottom",
            ...props
        },
        ref,
    ) => {
        const mouseX = useMotionValue(Infinity);

        const renderChildren = () => {
            return React.Children.map(children, (child) => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child as React.ReactElement<DockIconProps>, {
                        mouseX: mouseX,
                        magnification: magnification,
                        distance: distance,
                    });
                }
                return child;
            });
        };

        return (
            <motion.div
                ref={ref}
                onMouseMove={(e) => mouseX.set(e.pageX)}
                onMouseLeave={() => mouseX.set(Infinity)}
                {...props}
                className={cn(dockVariants({ className }), {
                    "items-start": direction === "top",
                    "items-center": direction === "middle",
                    "items-end": direction === "bottom",
                })}
            >
                {renderChildren()}
            </motion.div>
        );
    },
);

Dock.displayName = "Dock";

export interface DockIconProps {
    magnification?: number;
    distance?: number;
    mouseX?: MotionValue<number>;
    className?: string;
    children?: React.ReactNode;
    props?: unknown;
    href?: string;
    label?: string;
    active?: boolean;
    onClick?: () => void;
}

const DockIcon = ({
    magnification = 60,
    distance = 140,
    mouseX,
    className,
    children,
    href,
    label,
    active,
    onClick,
    ...props
}: DockIconProps) => {
    const ref = useRef<HTMLDivElement>(null);

    const defaultMouseX = useMotionValue(Infinity);
    const value = mouseX ?? defaultMouseX;

    const distanceCalc = useTransform(value, (val: number) => {
        const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
        return val - bounds.x - bounds.width / 2;
    });

    const widthSync = useTransform(
        distanceCalc,
        [-distance, 0, distance],
        [40, magnification, 40],
    );

    const width = useSpring(widthSync, {
        mass: 0.1,
        stiffness: 150,
        damping: 12,
    });

    const content = (
        <motion.div
            ref={ref}
            style={{ width }}
            className={cn(
                "flex aspect-square cursor-pointer items-center justify-center rounded-full",
                className,
            )}
            {...props}
        >
            {children}
        </motion.div>
    )

    if (href) {
        return (
            <Link
                to={href}
                aria-label={label}
                aria-current={active ? 'page' : undefined}
                className={cn(
                    "rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9B87F5] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08070B]",
                    active
                        ? "border border-[#7357D9]/35 bg-[#7357D9]/14 text-[#B7A7FF]"
                        : "border border-transparent text-zinc-500",
                )}
                onClick={onClick}
            >
                {content}
            </Link>
        )
    }

    if (onClick) {
        return <div onClick={onClick} className="focus:outline-none">{content}</div>
    }

    return content;
};

DockIcon.displayName = "DockIcon";

export { Dock, DockIcon };
