import React from "react";
import "./StudyCarousel.css"
import Carousel from "react-multi-carousel";
import 'react-multi-carousel/lib/styles.css';
import { getColorForStudy } from "../../RaceThemes/Ghosts/GhostService";

function StudyCarousel() {
    const studies = [{
        study: "Computer Science",
        abbreviation: "CSE"
    },
    {
        study: "Aerospace Engineering",
        abbreviation: "AE"
    },
    {
        study: "Civil Engineering",
        abbreviation: "CE"
    },
    {
        study: "Maritime Engineering",
        abbreviation: "MAR"
    },
    {
        study: "Applied Sciences",
        abbreviation: "AS"
    },
    {
        study: "Mechanical Engineering",
        abbreviation: "MCH"
    }]

    return(
        <div>
            <Carousel  additionalTransfrom={0}
            arrows
            autoPlaySpeed={3000}
            autoPlay={true}
            centerMode={false}
            className=""
            containerClass="container"
            dotListClass=""
            draggable
            focusOnSelect={false}
            infinite
            itemClass=""
            keyBoardControl
            minimumTouchDrag={80}
            pauseOnHover
            renderArrowsWhenDisabled={false}
            renderButtonGroupOutside={false}
            renderDotsOutside={false}
            responsive={{
                largeDesktop: {
                    breakpoint: {
                        max: 6000,
                        min: 2500
                    },
                    items: 5,
                    },
                desktop: {
                breakpoint: {
                    max: 2500,
                    min: 1430
                },
                items: 4,
                },
                laptop: {
                    breakpoint: {
                        max: 1430,
                        min: 1200
                    },
                    items: 3,
                },
                mobile: {
                breakpoint: {
                    max: 464,
                    min: 0
                },
                items: 2,
                },
                tablet: {
                breakpoint: {
                    max: 1200,
                    min: 464
                },
                items: 3,
                }
            }}
            rewind={false}
            rewindWithAnimation={false}
            rtl={false}
            shouldResetAutoplay
            showDots={false}
            sliderClass=""
            slidesToSlide={1}
            swipeable>
                        {studies.map((study, index) => (
                            <div key={index} className="study-carousel-item">
                                <div className="study-color" style={{backgroundColor: getColorForStudy(study.abbreviation).mainColor}}></div>
                                <div className="carousel-item-caption">{study.study}</div>
                            </div>
                        ))}
            </Carousel>
        </div>
    )
}

export default StudyCarousel