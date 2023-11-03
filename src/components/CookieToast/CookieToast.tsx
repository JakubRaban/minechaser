import { useEffect } from 'react'
import toast, { Toast, Toaster } from 'react-hot-toast'
import config from '../../config'
import { ExternalPageIcon } from '../../icons/ExternalPage/ExternalPageIcon'

import './CookieToast.scss'

const CookieToast = () => {
    const { STORAGE: storage } = config
    const dateAccepted = Number(storage.getItem('rmCookiesAccepted'))
    const acceptExpired = !dateAccepted || Date.now() - dateAccepted > 180 * 24 * 60 * 60 * 1000

    const onAccept = (t: Toast) => {
        storage.setItem('rmCookiesAccepted', String(Date.now()))
        window.dispatchEvent(new Event('cookiesaccept'))
        toast.dismiss(t.id)
    }

    useEffect(() => {
        if (acceptExpired) {
            toast(t => (
                <span>
                    <div>
                        MineChaser shares some anonymized user data with third-party services to ensure its reliability
                        (<a href="https://rollbar.com" target="_blank" rel="noreferrer">Rollbar<ExternalPageIcon /></a>)
                        and better understand its user base
                        (<a href="https://marketingplatform.google.com/intl/en/about/analytics/" target="_blank" rel="noreferrer">Google Analytics<ExternalPageIcon /></a>)
                        in accordance with <a href="/privacypolicy">Privacy Policy</a>. You can opt out at any time.
                    </div>
                    <div className="buttons">
                        <button onClick={() => onAccept(t)}>Accept</button>
                        <button onClick={() => toast.dismiss(t.id)} className="secondary outline">Reject</button>
                    </div>
                </span>
            ), { duration: Number.POSITIVE_INFINITY })
        } else {
            setTimeout(() => window.dispatchEvent(new Event('cookiesaccept')), 200)
        }
    }, [])

    return acceptExpired ? <Toaster position="bottom-right" toastOptions={{ className: 'toast cookie-toast' }} /> : null
}

export default CookieToast
