package graph

import "github.com/Abhishek260305/HookForge/services/graphql-gateway/internal/controlplane"

// Resolver is the root dependency container for GraphQL resolvers.
type Resolver struct {
	ControlPlane *controlplane.Client
}
