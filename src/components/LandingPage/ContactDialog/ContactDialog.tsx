import { Dialog, DialogHeader } from '../../lib/Dialog/Dialog'

import './ContactDialog.scss'

const ContactDialog = () =>
    <Dialog className="contact-dialog" open>
        <DialogHeader title="Contact Me" />
        <div>
            <p>For any feedback, feature request, suggestion or error report, feel free to contact me at:</p>
            <p><b><a href="mailto:minechaser@jakubraban.com">minechaser@jakubraban.com</a></b></p>
            <p>Thank you &lt;3</p>
        </div>
    </Dialog>

export default ContactDialog
