"""Typed application errors and codes — port of src/server/utils/errors.js."""


class AppError(Exception):
    """Base for all known application errors."""

    def __init__(
        self,
        message: str = "Something went wrong",
        status_code: int = 500,
        code: str = "INTERNAL_ERROR",
        details: dict | list | None = None,
    ):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.code = code
        self.details = details


class UnauthorizedError(AppError):
    def __init__(self, message: str = "Authentication required"):
        super().__init__(message=message, status_code=401, code="UNAUTHORIZED")


class ForbiddenError(AppError):
    def __init__(self, message: str = "You do not have permission to do this"):
        super().__init__(message=message, status_code=403, code="FORBIDDEN")


class NotFoundError(AppError):
    def __init__(self, message: str = "Resource not found"):
        super().__init__(message=message, status_code=404, code="NOT_FOUND")


class ValidationError(AppError):
    def __init__(self, message: str = "Invalid input", details: dict | list | None = None):
        super().__init__(message=message, status_code=400, code="VALIDATION_ERROR", details=details)
