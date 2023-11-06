import { Dialog, DialogHeader } from '../../lib/Dialog/Dialog'

const CreditsDialog = () => (
    <Dialog className="credits-dialog" open>
        <DialogHeader title="Credits" />
        <div>
            <p>Music by Eric Matyas &ndash; <a href="http://soundimage.org">soundimage.org</a></p>
        </div>
    </Dialog>
)

export default CreditsDialog
