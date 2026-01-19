import { useRef } from "react";
import type { ReactNode, RefObject } from "react";
import { Overlay, Popover as BsPopover } from "react-bootstrap";

interface PopoverProps {
  placement?:
    | "auto"
    | "top"
    | "bottom"
    | "left"
    | "right"
    | "auto-start"
    | "auto-end"
    | "top-start"
    | "top-end"
    | "bottom-start"
    | "bottom-end"
    | "right-start"
    | "right-end"
    | "left-start"
    | "left-end";
  children: React.ReactElement;
  content: ReactNode;
  show: boolean;
  onToggle?: () => void;
  className?: string;
  triggerRef: RefObject<HTMLElement>;
}

export default function Popover({ children, content, show, onToggle, placement = "bottom", className = "", triggerRef }: PopoverProps) {
  const localTriggerRef = useRef(null);
  const ref = triggerRef || localTriggerRef;

  return (
    <>
      <span ref={ref} onClick={onToggle} className={className}>
        {children}
      </span>
      <Overlay target={ref.current} show={show} placement={placement} rootClose={true} onHide={onToggle}>
        <BsPopover id="popover-shared" className={className}>
          <BsPopover.Body>{content}</BsPopover.Body>
        </BsPopover>
      </Overlay>
    </>
  );
}
