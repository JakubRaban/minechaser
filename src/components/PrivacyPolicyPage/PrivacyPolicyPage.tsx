import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import config from '../../config'
import { removeAllCookies } from '../../helpers'

const PrivacyPolicyPage = () => {
    const { STORAGE: storage } = config
    const [cookiesAccepted, setCookiesAccepted] = useState(
        Date.now() - new Date(Number(storage.getItem('rmCookiesAccepted'))).getTime() < 180 * 24 * 60 * 60 * 1000,
    )
    
    const onAccept = () => {
        storage.setItem('rmCookiesAccepted', String(Date.now()))
        window.dispatchEvent(new Event('cookiesaccept'))
        setCookiesAccepted(true)
    }
    
    const onReject = () => {
        storage.removeItem('rmCookiesAccepted')
        window.dispatchEvent(new Event('cookiesnonaccept'))
        removeAllCookies()
        setCookiesAccepted(false)
    }

    useEffect(() => {
        const accepted = () => setCookiesAccepted(true)
        window.addEventListener('cookiesaccept', accepted)
        return () => window.addEventListener('cookiesaccept', accepted)
    }, [])
    
    return (
        <>
            <header>
                <h1>Privacy Policy</h1>
                <p>Always available at <a href={window.location.href}>{window.location.href}</a></p>
                <p>Effective date {new Date(1698836400000).toLocaleDateString()}</p>
                <Link to="/">&larr; Back to MineChaser</Link>
            </header>
            <main>
                <h2>Introduction</h2>
                <p>
                    Welcome to Minechaser.com (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;).
                    We are committed to protecting your privacy and ensuring the security of your personal information.
                    This Privacy Policy outlines how we collect, use, disclose, and safeguard your data in accordance
                    with the General Data Protection Regulation (GDPR) and other applicable data protection laws.
                    By accessing and using our website, you consent to the practices described in this Privacy Policy.
                </p>

                <h2>Information We Collect</h2>

                <h3>User-Provided Information</h3>
                <p>We may collect and store the following information that you provide to us when using our website:</p>
                <ul>
                    <li><b>Username</b>: We collect the arbitrary user-created usernames that you provide before
                        starting a game.
                    </li>
                </ul>

                <h3>Automatically Collected Information</h3>
                <p>
                    In addition to user-provided information, we may collect certain information automatically when you
                    access our website.
                    You have a right to not consent or revoke the consent to collect this information at any time:
                </p>
                <label style={{ border: '3px solid #9062ca', padding: '12px' }}>
                    <input type="checkbox" role="switch" checked={cookiesAccepted} onChange={e => e.target.checked ? onAccept() : onReject()} />
                    Consent to Automatically Collected Information
                </label>
                <ul>
                    <li>
                        <b>Google Analytics</b>:
                        We use Google Analytics, a third-party service, to analyze user interactions with our website.
                        Google Analytics may collect information such as your IP address, browser type, operating
                        system, and website activity.
                        No personally identifiable information is sent to Google Analytics.
                        You can learn more about Google Analytics and its data practices by visiting their privacy
                        policy at&nbsp;
                        <a href="https://policies.google.com/privacy" target="_blank"
                            rel="noreferrer">https://policies.google.com/privacy</a>.
                    </li>
                    <li>
                        <b>Rollbar</b>:
                        We use Rollbar, a third-party service, to monitor and track errors on our website for debugging
                        purposes.
                        Rollbar may collect error logs and technical information, such as your IP address, browser type,
                        operating system,
                        screen resolution and so on, but does not collect personally identifiable information.
                        For more details, please refer to Rollbar&apos;s privacy policy at&nbsp;
                        <a href="https://rollbar.com/privacy" target="_blank"
                            rel="noreferrer">https://rollbar.com/privacy</a>.
                    </li>
                </ul>
                <p>
                    We may also collect information that your browser sends whenever you visit our Service.
                </p>

                <h3>Tracking Technologies and Cookies</h3>
                <p>To accomplish the above, we use the following technologies to store information:</p>
                <ul>
                    <li>
                        <b>Cookies</b>:
                        We use cookies to collect information about your usage of our website.
                        Cookies are small text files that are stored on your device and are used for authentication,
                        session management, and website analytics.
                    </li>
                    <li>
                        <b>Local Storage</b>:
                        Local storage is a web technology used to store information on your device.
                        We may use local storage to store user preferences and a session token, which allows you
                        to have a personalized and more seamless experience on our website.
                    </li>
                </ul>

                <h2>How We Use Your Information</h2>
                <p>We use the collected information for the following purposes:</p>
                <ul>
                    <li>To provide and improve our website&apos;s functionality and user experience</li>
                    <li>To respond to your inquiries and requests.</li>
                    <li>To detect, prevent, and address technical issues and errors.</li>
                    <li>To analyze website traffic and usage patterns.</li>
                    <li>To maintain your session on our website.</li>
                    <li>To fulfill our legal obligations and protect our rights and interests.</li>
                </ul>

                <h2>Data Sharing and Disclosure</h2>
                <p>We do not sell or share your personal information with third parties except as described in this
                    Privacy Policy.</p>

                <h2>Data Retention</h2>
                <p>
                    We will retain your information only for as long as necessary to fulfill the purposes outlined in
                    this Privacy Policy, and as required by applicable law.
                    Moreover, usernames and associated user sessions are removed after 30 days of non-usage of the
                    website.
                </p>

                <h2>Your Rights</h2>
                <p>You have the following rights:</p>
                <ul>
                    <li>Right to access your personal information.</li>
                    <li>Right to rectify any inaccurate or incomplete data.</li>
                    <li>Right to erase your personal data (subject to legal requirements).</li>
                    <li>Right to restrict processing of your data.</li>
                    <li>Right to object to processing based on legitimate interests.</li>
                </ul>
                <p>To exercise these rights, please contact us using the contact information provided below.</p>

                <h2>Contact Us</h2>
                <p>
                    If you have any questions, concerns, or requests related to your privacy or this Privacy Policy,
                    please contact us at:&nbsp;
                    <b><a href="mailto:minechaser@jakubraban.com">minechaser@jakubraban.com</a></b>
                </p>

                <h2>Changes to This Privacy Policy</h2>
                <p>
                    We may update this Privacy Policy from time to time to reflect changes in our data practices or
                    legal requirements.
                    Please review this Privacy Policy periodically to stay informed about how we protect your data.
                    Any meaningful changes to this Privacy Policy will be announced on the main page as a notification
                    bar.
                </p>

                <button>
                    <Link to="/" style={{ color: 'white' }}>Back to Minechaser</Link>
                </button>
            </main>
        </>
    )
}

export default PrivacyPolicyPage
