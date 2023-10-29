import { FC, useEffect, useRef } from 'react'
import { ErrorCode, errorCodeToMessage } from '../../../helpers'
import { toast, Toaster } from 'react-hot-toast'

const StatusToast: FC<{ error: string; success: string }> = ({ error, success }) => {
    const toastId = useRef<string | undefined>()

    useEffect(() => {
        if (error) {
            toastId.current = toast.error(errorCodeToMessage(error as ErrorCode) ?? error)
        } else if (success) {
            toastId.current = toast.success(success)
        }
    }, [error])

    return <Toaster position="bottom-center" toastOptions={{ className: 'toast' }} />
}

export default StatusToast
