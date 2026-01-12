import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogContextValue {
    open: boolean;
    setOpen: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextValue | null>(null);

function Dialog({
    children,
    open: controlledOpen,
    onOpenChange,
}: {
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}) {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : uncontrolledOpen;

    const setOpen = React.useCallback(
        (value: boolean) => {
            if (!isControlled) {
                setUncontrolledOpen(value);
            }
            onOpenChange?.(value);
        },
        [isControlled, onOpenChange]
    );

    return (
        <DialogContext.Provider value={{ open, setOpen }}>
            {children}
        </DialogContext.Provider>
    );
}

function DialogTrigger({
    children,
    asChild,
    ...props
}: React.ComponentProps<"button"> & { asChild?: boolean }) {
    const context = React.useContext(DialogContext);

    const handleClick = () => context?.setOpen(true);

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<any>, {
            onClick: handleClick,
        });
    }

    return (
        <button type="button" onClick={handleClick} {...props}>
            {children}
        </button>
    );
}

function DialogPortal({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

function DialogClose({
    children,
    asChild,
    ...props
}: React.ComponentProps<"button"> & { asChild?: boolean }) {
    const context = React.useContext(DialogContext);

    const handleClick = () => context?.setOpen(false);

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<any>, {
            onClick: handleClick,
        });
    }

    return (
        <button type="button" onClick={handleClick} {...props}>
            {children}
        </button>
    );
}


function DialogOverlay({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const context = React.useContext(DialogContext);

    if (!context?.open) return null;

    return (
        <div
            data-slot="dialog-overlay"
            className={cn(
                "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                className
            )}
            data-state={context.open ? "open" : "closed"}
            onClick={() => context.setOpen(false)}
            {...props}
        />
    );
}

function DialogContent({
    className,
    children,
    ...props
}: React.ComponentProps<"div">) {
    const context = React.useContext(DialogContext);

    React.useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                context?.setOpen(false);
            }
        };

        if (context?.open) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "";
        };
    }, [context?.open, context]);

    if (!context?.open) return null;

    return (
        <>
            <DialogOverlay />
            <div
                data-slot="dialog-content"
                className={cn(
                    "fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg",
                    className
                )}
                data-state={context.open ? "open" : "closed"}
                onClick={(e) => e.stopPropagation()}
                {...props}
            >
                {children}
                <button
                    type="button"
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
                    onClick={() => context.setOpen(false)}
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </button>
            </div>
        </>
    );
}

function DialogHeader({
    className,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="dialog-header"
            className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
            {...props}
        />
    );
}

function DialogFooter({
    className,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="dialog-footer"
            className={cn(
                "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
                className
            )}
            {...props}
        />
    );
}

function DialogTitle({
    className,
    ...props
}: React.ComponentProps<"h2">) {
    return (
        <h2
            data-slot="dialog-title"
            className={cn("text-lg font-semibold leading-none tracking-tight", className)}
            {...props}
        />
    );
}

function DialogDescription({
    className,
    ...props
}: React.ComponentProps<"p">) {
    return (
        <p
            data-slot="dialog-description"
            className={cn("text-sm text-muted-foreground", className)}
            {...props}
        />
    );
}

export {
    Dialog,
    DialogPortal,
    DialogOverlay,
    DialogTrigger,
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
};
