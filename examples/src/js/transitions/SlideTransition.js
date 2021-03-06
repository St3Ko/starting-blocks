/*
 * Copyright (c) 2017. Ambroise Maupate and Julien Blanchet
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is furnished
 * to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 *
 * Except as contained in this notice, the name of the ROADIZ shall not
 * be used in advertising or otherwise to promote the sale, use or other dealings
 * in this Software without prior written authorization from Ambroise Maupate and Julien Blanchet.
 *
 * @file SlideTransition.js
 * @author Adrien Scholaert <adrien@rezo-zero.com>
 */

import { AbstractTransition } from 'starting-blocks'
import { TweenMax, Power4 } from 'gsap'
import 'gsap/ScrollToPlugin'

/**
 * Slide Transition class example.
 *
 * @extends {AbstractTransition}
 */
export default class SlideTransition extends AbstractTransition {
    /**
     * Entry point of the animation
     * Automatically called on init()
     */
    start () {
        Promise.all([this.newPageLoading, this.slideOut()])
            .then(this.slideIn.bind(this))
    }

    /**
     * Slide out the old content.
     * @returns {Promise}
     */
    slideOut () {
        return new Promise((resolve) => {
            TweenMax.to(this.oldPage.$cont, 0.5, {
                xPercent: 25,
                alpha: 0,
                easing: Power4.easeIn,
                onComplete: resolve
            })
        })
    }

    /**
     * Slide in the new content
     */
    slideIn () {
        TweenMax.set(this.oldPage.$cont, {
            display: 'none'
        })

        TweenMax.set(this.newPage.$cont, {
            position: 'absolute',
            visibility: 'visible',
            alpha: 0,
            xPercent: -25
        })

        this.newPage.checkLazyload()

        TweenMax.to(this.newPage.$cont, 0.75, {
            xPercent: 0,
            alpha: 1,
            easing: Power4.easeOut,
            onComplete: () => {
                TweenMax.set(this.newPage.$cont, { 'position': 'static' })
                this.done()
            }
        })
    }
}
