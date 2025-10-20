
import { Spinner } from "../ui/spinner";


function SpinnerPage({ className, ...props }: React.ComponentProps<"svg">) {
  return (
        <div className={`flex w-dvw h-dvh justify-center ${className ?? ""}`.trim()}>
            <Spinner {...props} className="size-8 self-center" />
        </div>
  )
}

export { SpinnerPage }
