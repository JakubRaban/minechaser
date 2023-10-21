import { FC, useEffect, useRef } from 'react'
import { ErrorCode, errorCodeToMessage } from '../../../helpers'
import { toast, Toaster } from 'react-hot-toast'

const ErrorToast: FC<{ error: string }> = ({ error }) => {
    const toastId = useRef<string | undefined>()

    useEffect(() => {
        if (error) {
            toastId.current = toast.error(errorCodeToMessage(error as ErrorCode) ?? error)
        }
    }, [error])

    return <Toaster position="bottom-center" toastOptions={{ className: 'toast' }} />
}

export default ErrorToast
