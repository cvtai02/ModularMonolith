# ADR-001: Use EF Core in the Shared Kernel

## Context
Modules Usecases need to take advantage of EFCore DbSet. Howver EFCore is not design for Clean Architecture. 

## Decision
Some repos use an abstraction IApplicationDbContext, I dont see any difference. So I 

## Rationale

## Consequences