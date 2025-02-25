
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { DialogContent } from "./dialog-content"
import { DialogHeader, DialogFooter } from "./dialog-header"
import { DialogTitle, DialogDescription } from "./dialog-title"
import { DialogOverlay, DialogPortal } from "./dialog-overlay"

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogClose = DialogPrimitive.Close

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogOverlay,
  DialogPortal,
}
