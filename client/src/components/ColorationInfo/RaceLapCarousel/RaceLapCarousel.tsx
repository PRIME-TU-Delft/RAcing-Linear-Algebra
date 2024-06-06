import React from "react";
import "./RaceLapCarousel.css"
import Carousel from "react-multi-carousel";
import 'react-multi-carousel/lib/styles.css';
import { m } from "framer-motion";

function RaceLapCarousel() {
    const colors = ["#23D851", "#E8E807", "#D81212", "#FF15E9", "#A129FF"]    // colors used to distinguish between the different race laps
    const responsive = {
        superLargeDesktop: {
            // the naming can be any, depends on you.
            breakpoint: { max: 4000, min: 3000 },
            items: 5,
            partialVisibilityGutter: 40 // this is needed to tell the amount of px that should be visible.

          },
          desktop: {
            breakpoint: { max: 3000, min: 1024 },
            items: 5,
            partialVisibilityGutter: 40 // this is needed to tell the amount of px that should be visible.

          },
          tablet: {
            breakpoint: { max: 1024, min: 464 },
            items: 3,
            partialVisibilityGutter: 40 // this is needed to tell the amount of px that should be visible.

          },
          mobile: {
            breakpoint: { max: 464, min: 0 },
            items: 3
          }
    }

    return(<div>
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
                        {colors.map((color, index) => (
                            <div key={index} className="race-lap-carousel-item">
                                <div className="lap-color" style={{borderColor: color}}></div>
                                <div className="carousel-item-caption">Lap {index + 1}</div>
                            </div>
                        ))}
            </Carousel>
    </div>)
}

export default RaceLapCarousel