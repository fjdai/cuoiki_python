from enum import Enum

class Status(str, Enum):
    Pending = "Pending"
    Accept = "Accept"
    Reject = "Reject"
    Done = "Done" 