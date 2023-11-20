import { useRef, useState } from 'react'
import { Dialog, DialogHeader } from '../../lib/Dialog/Dialog'
import config from '../../../config'
import { useNavigate } from 'react-router'

import './ContactDialog.scss'

const ContactDialog = () => {
    const [isSending, setIsSending] = useState(false)
    const formRef = useRef<HTMLFormElement>(null)
    const navigate = useNavigate()

    const submit = (e: any) => {
        e.preventDefault()
        setIsSending(true)
        Promise.all([
            fetch(`${config.SERVER_URL}/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(Object.fromEntries(new FormData(formRef.current!))),
            }),
            new Promise(resolve => setTimeout(resolve, 300)),
        ]).then(([res]) => {
            if (res.ok) {
                navigate('/', { state: { success: 'Message has been sent. Thank you!' } })
            }
        })
    }

    return (
        <Dialog className="contact-dialog" open>
            <DialogHeader title="Contact Me" />
            <div>
                <p>
                    Whether you have any feedback or suggestions regarding Minechaser, or you want to discuss a different topic,
                    feel free to contact me using the form below. I&apos;ll answer as soon as I can. Thank you!
                </p>
                <form ref={formRef} onSubmit={submit}>
                    <label>
                        Your E-mail
                        <input required type="email" name="email" placeholder="john@example.com" />
                    </label>
                    <label>
                        Your Message
                        <textarea required name="message" minLength={20} maxLength={1000} />
                    </label>
                    <div>
                        <button type="submit" disabled={isSending}>Send</button>
                        {isSending && <span className="spinner" />}
                    </div>
                </form>
            </div>
        </Dialog>
    )
}

export default ContactDialog
