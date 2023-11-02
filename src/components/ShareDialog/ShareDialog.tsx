import { FC } from 'react'
import {
    EmailIcon,
    EmailShareButton,
    FacebookIcon,
    FacebookMessengerIcon,
    FacebookMessengerShareButton,
    FacebookShareButton, LinkedinIcon, LinkedinShareButton,
    RedditIcon,
    RedditShareButton,
    TelegramIcon,
    TelegramShareButton,
    TwitterIcon,
    TwitterShareButton,
    WhatsappIcon,
    WhatsappShareButton,
} from 'react-share'

import './ShareDialog.scss'

interface ShareDialogProps {
    open: boolean
    onClose: () => void
}

const url = `${location.protocol}//${location.host}`
const subject = 'Check out MineChaser'
const body = 'I recently played this game and I\'d like to show it to you'

const props = { url, subject, body, title: subject }
const size = 100

const ShareDialog: FC<ShareDialogProps> = ({ open, onClose }) => {
    return (
        <dialog className="share-dialog" open={open}>
            <article>
                <h1>Share MineChaser</h1>
                <div className="share-buttons">
                    <FacebookShareButton {...props}>
                        <FacebookIcon size={size} round={true} />
                    </FacebookShareButton>
                    <FacebookMessengerShareButton appId="639165991660318" redirectUri={location.href} url={url}>
                        <FacebookMessengerIcon size={size} round={true} />
                    </FacebookMessengerShareButton>
                    <TwitterShareButton {...props}>
                        <TwitterIcon size={size} round={true} />
                    </TwitterShareButton>
                    <RedditShareButton {...props}>
                        <RedditIcon size={size} round={true} />
                    </RedditShareButton>
                    <WhatsappShareButton {...props}>
                        <WhatsappIcon size={size} round={true} />
                    </WhatsappShareButton>
                    <TelegramShareButton {...props}>
                        <TelegramIcon size={size} round={true} />
                    </TelegramShareButton>
                    <LinkedinShareButton {...props} source="MineChaser">
                        <LinkedinIcon size={size} round={true} />
                    </LinkedinShareButton>
                    <EmailShareButton {...props}>
                        <EmailIcon size={size} round={true} />
                    </EmailShareButton>
                </div>
                <footer>
                    <button onClick={onClose}>Close</button>
                </footer>
            </article>
        </dialog>
    )
}

export default ShareDialog
