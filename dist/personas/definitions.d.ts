import { PersonaDefinition, PersonaType } from '../types';
export declare const personas: Record<PersonaType, PersonaDefinition>;
/**
 * Get a persona by type
 */
export declare function getPersona(type: PersonaType): PersonaDefinition | undefined;
/**
 * Get a random persona
 */
export declare function getRandomPersona(): PersonaDefinition;
/**
 * Get all persona types
 */
export declare function getAllPersonaTypes(): PersonaType[];
//# sourceMappingURL=definitions.d.ts.map