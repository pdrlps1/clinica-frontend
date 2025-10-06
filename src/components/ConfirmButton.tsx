import { PropsWithChildren } from "react";

type ConfirmButtonProps = PropsWithChildren<{
    message?: string;
    onConfirm: () => void | Promise<void>;
    className?: string;
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
}>;

export default function ConfirmButton({
    message = "Confirmar ação?",
    onConfirm,
    className,
    disabled,
    type = "button",
    children,
}: ConfirmButtonProps) {
    async function handleClick() {
        const ok = confirm(message);
        if (!ok) return;
        await onConfirm();
    }
    return (
        <button type={type} className={className} onClick={handleClick} disabled={disabled}>
            {children}
        </button>
    );
}


