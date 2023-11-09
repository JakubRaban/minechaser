import jakub from '/images/jakub256.jpeg'
import { Dialog, DialogHeader } from '../../lib/Dialog/Dialog'
import { Link } from 'react-router-dom'

import './AboutDialog.scss'

const AboutDialog = () =>
    <Dialog className="about-dialog" open>
        <DialogHeader title="Hello, I'm Jakub" />
        <div>
            <img src={jakub} alt="Jakub Raban" />
            <div>
                <p>
                    I&apos;m a full-stack software developer originally from Poland. Currently I work at CERN in
                    Geneva, Switzerland,
                    where I develop a website used to monitor the CERN accelerator control system, among
                    others.
                    In my free time I travel, work out, learn languages and never refuse a good fondue.
                </p>
                <p>
                    MineChaser is my first publicly available website and I really hope you enjoy it.
                    Feel free to reach out to me with any suggestions, feedback, or if you want to have a coffee
                    with me in Geneva.
                </p>
                <p>
                    <span><Link to="/contact">Send a Message</Link></span>
                    <span><a href="https://linkedin.com/in/jakub-raban/" target="_blank"
                        rel="noreferrer">LinkedIn</a></span>
                    <span><a href="https://github.com/JakubRaban" target="_blank"
                        rel="noreferrer">GitHub</a></span>
                </p>
            </div>
        </div>
    </Dialog>

export default AboutDialog
