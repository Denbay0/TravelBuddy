from enum import Enum


class TransportType(str, Enum):
    CAR = "Автомобиль"
    PLANE = "Самолёт"
    TRAIN = "Поезд"
    WALK = "Пешком"

