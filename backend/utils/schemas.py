from pydantic import BaseModel, Field


class Sense(BaseModel):
    definition: str
    examples: list[str] = Field(default_factory=list)


class Entry(BaseModel):
    headword: str
    pos: str
    senses: list[Sense]
    cross_refs: list[str] = Field(default_factory=list)
