import React from "react";
import "./RaceLapCarousel.css"
import Carousel from "react-multi-carousel";
import 'react-multi-carousel/lib/styles.css';
import { m } from "framer-motion";

function RaceLapCarousel() {
    const colors = ["#23D851", "#E8E807", "#D81212", "#FF15E9", "#A129FF"]    // colors used to distinguish between the different race laps

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
          partialVisible
          pauseOnHover
          renderArrowsWhenDisabled={false}
          renderButtonGroupOutside={false}
          renderDotsOutside={false}
          // Defining breakpoints for responsiveness of the carousel component
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
                    {/* For each of the race lap colors, display an element showing the lap number associated with it */}
                    {colors.map((color, index) => (
                        <div key={index} className="race-lap-carousel-item">
                            <div className="lap-color" style={{borderColor: color}}></div>
                            <div className="carousel-item-caption">Lap {index + 1}</div>
                        </div>
                    ))}
        </Carousel>
    </div>
  )
}

export default RaceLapCarousel