import logging

def good_function():
    logger = logging.getLogger(__name__)
    logger.info("This is good")

def bad_function():
    print("This is bad")
    print("Multiple", "violations")