import { useNavigate } from 'react-router'
import { Dialog } from '../../lib/Dialog/Dialog'

import './ContactDialog.scss'

const ContactDialog = () => {
    const navigate = useNavigate()
    
    return (
        <Dialog className="contact-dialog" open>
            <div className="header-container">
                <h1>Contact Me</h1>
                <button className="close" onClick={() => navigate('/')} />
            </div>
            <div>
                <p>For any feedback, feature request, suggestion or error report, feel free to contact me at:</p>
                <p><b><a href="mailto:minechaser@jakubraban.com">minechaser@jakubraban.com</a></b></p>
                <p>Thank you &lt;3</p>
            </div>
        </Dialog>
    )
}

export default ContactDialog
