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
                desktop: {
                breakpoint: {
                    max: 3000,
                    min: 1024
                },
                items: 4,
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
                    max: 1024,
                    min: 464
                },
                items: 4,
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