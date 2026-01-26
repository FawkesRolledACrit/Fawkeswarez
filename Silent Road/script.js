
const pathSkills = {
    soiledHands: {
        major: "Warfare",
        minorOptions: ["Observation", "Social", "Adaptability", "Reverence"]
    },
    mutedSibilance: {
        major: "Reverence",
        minorOptions: ["Observation", "Social", "Adaptability", "Warfare"]
    },
    sanguineBoot: {
        major: "Adaptability",
        minorOptions: ["Observation", "Social", "Warfare", "Reverence"]
    },
    tranquilCountenance: {
        major: "Social",
        minorOptions: ["Observation", "Warfare", "Adaptability", "Reverence"]
    },
    penetratingIris: {
        major: "Observation",
        minorOptions: ["Warfare", "Social", "Adaptability", "Reverence"]
    }
};
const armamentAbilities = {
    melee: {
        parry: {
            name: "Parry",
            description: "Twice per day, you may immediately shrug off 1 Wound of damage upon taking it—even if that damage would otherwise be lethal.",
            progression: "At Rank 4, this ability mitigates 2 Wounds per use; at Rank 3, 3 Wounds; at Rank 2, 4 Wounds; and at Rank 1, 5 Wounds."
        },
        riposte: {
            name: "Riposte",
            description: "Once per Conflict, when an enemy misses you with an attack, you may make an immediate Basic Attack against them, capitalizing on their mistake.",
            progression: "Gain an additional use per Conflict each time you gain a new Rank."
        },
        surgeHound: {
            name: "Surge Hound",
            description: "When you defeat a Combatant, you immediately gain a Gloomtide Surge Point, reflecting the thrill and empowerment of combat.",
            limit: "Cannot increase your Gloomtide Surge Points above the maximum of 5."
        },
        manEater: {
            name: "Man-eater",
            description: "Once per day, you can unleash a devastating cleave that affects all Combatants within melee range, dealing Wounds equal to the number of Combatants struck.",
            progression: "Use increases to twice per day at Rank 4, three times at Rank 3, four times at Rank 2, and five times at Rank 1."
        },
        rendingWound: {
            name: "Rending Wound",
            description: "Once per Conflict, landing a basic attack inflicts a Bleeding Wound on the target. At the start of the enemy's Sequence, they take 1 Wound in bleeding damage, which persists until the end of the Conflict and cannot be healed.",
            progression: "Bleeding damage increases to 2 Wounds at Rank 4, 3 Wounds at Rank 3, 4 Wounds at Rank 2, and 5 Wounds at Rank 1."
        },
        whisperedShield: {
            name: "Whispered Shield",
            description: "Once per day, you may channel the Gloom's whispers into a protective shield that deflects all sources of damage from any attack about to hit you or an ally. This ability is used as an immediate reaction, even outside your Sequence, but leaves you unable to act for 4 Sequences afterward due to the strain.",
            progression: "The duration of this exhaustion decreases to 3 Sequences at Rank 4, 2 at Rank 2, and 1 at Rank 1."
        },
        furiousRebuke: {
            name: "Furious Rebuke",
            description: "When you take damage from a single hit that meets or exceeds your current Rank in Wounds, you may immediately reduce that damage by 1 Wound and deal 1 Wound back to the attacker in retaliation.",
            progression: "As you increase in Rank, this ability activates more frequently. At Rank 1, every attack you receive will trigger this effect since no attack can deal less than 1 Wound."
        }
    },
    ranged: {
        quickShot: {
            name: "Quick Shot",
            description: "Once per Conflict, you may fire twice as a single Basic Attack, making two separate rolls.",
            progression: "The number of uses per Conflict increases by 1 at each new Rank."
        },
        ricochet: {
            name: "Ricochet",
            description: "Once per Conflict, one of your projectiles may bounce off a Combatant, hitting another nearby Combatant. This attack deals full damage to the first target and 1 Wound to all other targets hit.",
            progression: "Uses increase by 1 per Rank gained."
        },
        longsight: {
            name: "Longsight",
            description: "You may increase the effective range of your attacks by 25 ft.",
            progression: "This range increases by an additional 25 ft. per Rank."
        },
        arcaneSnare: {
            name: "Arcane Snare",
            description: "Once per Conflict, when you hit a Combatant with an attack, you may choose to entangle them with spectral energy. The target is unable to move for one turn.",
            progression: "The number of rounds they are stuck, and the number of uses both increase by 1 per Rank."
        },
        trackingShot: {
            name: "Tracking Shot",
            description: "Once per day, when you hit a Combatant with a projectile, you become linked with them. You will know their exact location and condition for 1d4 hours, no matter the range.",
            progression: "The number of uses increases by 1 per Rank."
        },
        explosiveImpact: {
            name: "Explosive Impact",
            description: "Once per Conflict, one of your projectiles explodes on impact, hitting all other Combatants within 10 ft. of the target. This attack deals normal Wounds to the first target and deals a number of Wounds equal to the total number of targets hit with the explosion to all other Combatants affected.",
            progression: "The number of uses increases by 1 per Rank."
        },
        surreptitiousShot: {
            name: "Surreptitious Shot",
            description: "Once per Conflict, as long as you are not seen by any Combatants, you may make an attack that automatically hits its intended target. You may still roll for the attack, and on a Resounding Success, you gain a Surge Point and deal double your Armament's Wound Value instead of just +1.",
            progression: "The number of uses increases by 1 per Rank."
        },
        telekinesis: {
            name: "Telekinesis",
            description: "Once per day, you may choose any creature or object within 100 ft. of you and push or pull that object up to 10 ft. in any direction. The maximum weight of the object cannot exceed 10 lbs.",
            progression: "The weight limit increases to 50 lbs. at Rank 4, 100 lbs. at Rank 3, 200 lbs. at Rank 2, and 500 lbs. at Rank 1. The number of uses also increases by 1 per Rank."
        }
    }
};
const pathImages = {
    soiledHands: {
        path: "images/soiled hands 1.png",
        skill: "images/soiled hands 2.png"
    },
    mutedSibilance: {
        path: "images/muted 1.png",
        skill: "images/muted 2.png"
    },
    sanguineBoot: {
        path: "images/boot 1.png",
        skill: "images/boot 2.png"
    },
    tranquilCountenance: {
        path: "images/tranq 1.png",
        skill: "images/tranq 2.png"
    },
    penetratingIris: {
        path: "images/eye 1.png",
        skill: "images/eye 2.png"
    }
};
const shroudTypes = {
    nimble: {
        name: "Nimble Shroud",
        movement: "60 ft (Movement) / 120 ft (Dash)",
        cwt: "+1",
        abilities: {
            veilOfShadows: {
                name: "Veil of Shadows",
                description: "Once per day, transform into a misty shadow, rendering yourself effectively hidden from all living creatures in areas of low or no light. This effect lasts for 1D4 minutes.",
                progression: "The duration increases to 1D6 minutes at Rank 4, 1D8 at Rank 3, 1D10 at Rank 2, and 1D12 at Rank 1."
            },
            lightStepper: {
                name: "Light-Stepper",
                description: "Once per day, add 1 additional Action Die to any Adaptability roll you make, enhancing your ability to navigate or react swiftly.",
                progression: "The number of Action Dice added increases by 1 per Rank."
            },
            blur: {
                name: "Blur",
                description: "Once per Conflict, you may turn incorporeal as an immediate reaction upon being targeted by an attack, but before knowing if it will hit. When activated, this ability negates the damage of the triggering attack if it lands.",
                progression: "Increase the number of uses by 1 per Rank. At Rank 1, Blur can evade attacks that would automatically hit."
            },
            silentAmbusher: {
                name: "Silent Ambusher",
                description: "When your party initiates a Conflict, add 1 additional Action Die to any Action you attempt during the first Phase.",
                progression: "Increase the number of additional Action Dice by 1 per Rank."
            },
            quickReposition: {
                name: "Quick Reposition",
                description: "Once per Conflict, you may perform a Dash as a standard Movement, allowing you to cover distance rapidly.",
                progression: "Increase the number of uses per Conflict by 1 per Rank."
            },
            oneMoreTry: {
                name: "One More Try",
                description: "Once per day, if you fail an Adaptability roll, you may reroll the attempt. However, you must accept the result of the second roll, even if it's a Critical Failure.",
                progression: "Gain 1 additional use per day per Rank."
            },
            conversionTherapy: {
                name: "Conversion Therapy",
                description: "Once per day, you may expend any number of Surge Points to heal an equal number of Wounds.",
                progression: "At Rank 3, each Surge Point heals twice as many Wounds. At Rank 1, each Surge Point heals three times as many Wounds."
            },
            gloomyCharm: {
                name: "Gloomy Charm",
                description: "Once per day, add 1 additional Action Die to any Social roll you make, enhancing your charm and presence.",
                progression: "Increase the number of additional Action Dice by 1 per Rank."
            },
            featherFalling: {
                name: "Feather-Falling",
                description: "Once per day, activate this ability while falling from over 10 feet to negate all fall damage, landing safely on your feet.",
                progression: "Increase the number of uses per day by 1 per Rank."
            }
        }
    },
    balanced: {
        name: "Balanced Shroud",
        movement: "40 ft (Movement) / 80 ft (Dash)",
        cwt: "+3",
        abilities: {
            ironResolve: {
                name: "Iron Resolve",
                description: "Once per day, negate up to 3 Wounds from a single hit, even if it would otherwise be fatal.",
                progression: "Increase the Wounds negated by 1 for each Rank."
            },
            counterstrike: {
                name: "Counterstrike",
                description: "Once per Conflict, when an enemy lands an attack on you, you may immediately make a Basic Attack as a counter. This attack deals your Armament's normal Wound Value and can trigger even if the original hit is fatal.",
                progression: "Increase the number of uses per Conflict by 1 per Rank."
            },
            enduringResilience: {
                name: "Enduring Resilience",
                description: "Once per day, activate this ability to gain immunity to extreme temperatures for a number of hours equal to twice a 1D4 roll. While active, you are unaffected by most natural sources of heat or cold.",
                progression: "Increase the dice size to a D6 at Rank 3 and a D10 at Rank 1."
            },
            penumbralDrive: {
                name: "Penumbral Drive",
                description: "Any time you achieve a Resounding Success on an action, you gain 1 Conviction point. At Rank 4, you may also grant 1 Conviction point to an ally.",
                progression: "Grant Conviction to 2 allies at Rank 3, 3 at Rank 2, and 4 at Rank 1."
            },
            armoredAgility: {
                name: "Armored Agility",
                description: "Your Shroud negates all movement penalties while worn. Additionally, once per day, you may attempt to dodge an attack that would otherwise hit. Roll Adaptability; on a Success, take half Wounds (rounded down); on a Resounding Success, avoid the Wounds entirely.",
                progression: "Increase the number of uses per day by 1 per Rank."
            },
            understandingAbsorption: {
                name: "Understanding Absorption",
                description: "Once per Conflict, after receiving a Wound from a Combatant, you may sense their current condition. Additionally, all subsequent attacks from this Combatant will deal 1 fewer Wound.",
                progression: "Increase the Wound reduction by 1 per Rank."
            },
            extraPockets: {
                name: "Extra Pockets",
                description: "Your Shroud gains additional storage, providing 2 extra Item Slots.",
                progression: "Gain 1 additional Item Slot per Rank."
            },
            feeder: {
                name: "Feeder",
                description: "Provisions no longer sustain you. Instead, once per day, you must remove your Shroud and place it on a living or recently dead creature, which it will absorb over 1D6 minutes.",
                progression: "Increase the number of days you may go without feeding by 1 per Rank."
            },
            gloomPulse: {
                name: "Gloom Pulse",
                description: "Once per day, you may send a pulse through the Whispers of the Gloom, sensing any creature touched by it within 500 feet. This ability penetrates all surfaces except those containing Astralite.",
                progression: "Increase the range by 250 feet per Rank."
            }
        }
    },
    bulky: {
        name: "Bulky Shroud",
        movement: "20 ft (Movement) / 40 ft (Dash)",
        cwt: "+5",
        abilities: {
            unyieldingFortitude: {
                name: "Unyielding Fortitude",
                description: "At sunrise, you gain a temporary Wound buffer equal to your current Surge Points. This buffer absorbs damage before it impacts your main health. For each additional Rank you achieve, this buffer increases by Surge Points + 1 Wound, allowing you to reach a maximum Wound buffer of 9 Wounds at Rank 1 when you have maximum Surge Points.",
                progression: "Increase the Wound buffer by 1 per Rank."
            },
            obnoxiouslyLarge: {
                name: "Obnoxiously Large",
                description: "All Combatants target you on their first Phase, regardless of other threats. Any successful hits on you during this Phase deal 1 less Wound, with the reduction increasing by 1 per Rank.",
                progression: "Increase the Wound reduction by 1 per Rank."
            },
            titansResilience: {
                name: "Titan's Resilience",
                description: "Once per day, ignore what would otherwise be a lethal blow, leaving you with 1 Wound. The Wounds you are left with increase by 1 per Rank.",
                progression: "Increase the remaining Wounds by 1 per Rank."
            },
            stoneWaller: {
                name: "Stone-Waller",
                description: "Any Combatant passing within 5 feet of you triggers an immediate Basic Attack as a free reaction. If you wield an Extended Armament, this range extends to 10 feet. Each Rank adds 1 additional Wound to this Basic Attack's damage.",
                progression: "Deal an additional Wound with the Basic Attack per Rank."
            },
            shieldWall: {
                name: "Shield Wall",
                description: "Once per Conflict, intercept an attack directed at an ally within 10 feet, taking the damage on their behalf. Damage taken this way is halved, rounded down. Gain an additional use per Conflict at each Rank.",
                progression: "Increase uses per Conflict by 1 per Rank."
            },
            penumbralStare: {
                name: "Penumbral Stare",
                description: "Once per day, choose a living creature and make a Reverence roll. On a Success, the creature cowers in fear for 1D4 Phases; on a Resounding Success, this extends to 1D6 Phases. The creature regains its composure if attacked.",
                progression: "Gain +1 on your Reverence roll per Rank."
            },
            ironResolve: {
                name: "Iron Resolve",
                description: "Once per encounter, negate all damage from a single hit.",
                progression: "Gain an additional use of Iron Resolve per day at each Rank."
            },
            astraliteLining: {
                name: "Astralite Lining",
                description: "Increase your Critical Wound Threshold by 2, and gain an additional +1 to the Threshold per Rank.",
                progression: "Increase the Critical Wound Threshold by 1 per Rank."
            },
            moverAndShaker: {
                name: "Mover and Shaker",
                description: "Your Movement becomes 30/60 ft.; At Rank 3, this increases to 35/70 ft.; At Rank 1, it becomes 40/80.",
                progression: "Increases your Movement at Rank 3 and Rank 1."
            }
        }
    }
};
const pathDescriptions = {
    soiledHands: {
        title: "Path of the Soiled Hands",
        majorSkill: "Warfare",
        description: "For individuals who embrace the Path of the Soiled Hands, their primary emphasis lies in harnessing raw, concentrated strength, applied with unwavering determination. This path encompasses abilities associated with demolishing structures, enduring unforgiving environments, and delivering powerful blows.",
        stats: [
            "Warfare begins at Skill Rank 3",
            "Choose One Penumbral Art from Adaptability, Observation, Reverence, or Social",
            "The Art chosen begins at Skill Rank 4",
            "All Other Arts begin at Skill Rank 5",
            "Wound Threshold begins at 14"
        ]
    },
    mutedSibilance: {
        title: "Path of the Muted Sibilance",
        majorSkill: "Reverence",
        description: "The Muted Sibilance path delves into the mystical manipulation of Whispers of Power. It encompasses Whisperweaving, the art of using Mementos, and a deep connection to spirituality. Gloomstalkers on this path gain profound reverence for the unseen forces that shape Pyresh.",
        stats: [
            "Reverence begins at Skill Rank 3",
            "Choose One Penumbral Art from Adaptability, Observation, Warfare, or Social",
            "The Art chosen begins at Skill Rank 4",
            "All Other Arts begin at Skill Rank 5",
            "Wound Threshold begins at 10"
        ]
    },
    sanguineBoot: {
        title: "Path of the Sanguine Boot",
        majorSkill: "Adaptability",
        description: "Sanguine Boot is a path for Gloomstalkers who excel in quick thinking and nimble maneuvers. This path emphasizes the ability to adapt to rapidly changing circumstances, allowing practitioners to navigate treacherous environments with agility and precision.",
        stats: [
            "Adaptability begins at Skill Rank 3",
            "Choose One Penumbral Art from Warfare, Observation, Reverence, or Social",
            "The Art chosen begins at Skill Rank 4",
            "All Other Arts begin at Skill Rank 5",
            "Wound Threshold begins at 12"
        ]
    },
    tranquilCountenance: {
        title: "Path of the Tranquil Countenance",
        majorSkill: "Social",
        description: "The Tranquil Countenance path revolves around the art of socializing. It includes skills in negotiation, bartering, interrogation, and the delicate practice of pacifistic conflict resolution. Gloomstalkers on this path are masterful diplomats.",
        stats: [
            "Social begins at Skill Rank 3",
            "Choose One Penumbral Art from Adaptability, Observation, Reverence, or Warfare",
            "The Art chosen begins at Skill Rank 4",
            "All Other Arts begin at Skill Rank 5",
            "Wound Threshold begins at 8"
        ]
    },
    penetratingIris: {
        title: "Path of the Penetrating Iris",
        majorSkill: "Observation",
        description: "The Penetrating Iris path focuses on the keen observation of details. It encompasses skills such as charting courses, acquiring profound knowledge about the world, and the uncanny ability to perceive danger before it strikes.",
        stats: [
            "Observation begins at Skill Rank 3",
            "Choose One Penumbral Art from Adaptability, Warfare, Reverence, or Social",
            "The Art chosen begins at Skill Rank 4",
            "All Other Arts begin at Skill Rank 5",
            "Wound Threshold begins at 8"
        ]
    }
};
const armamentTypeDescriptions = {
    ranged: {
        title: "Ranged Armaments",
        description: "Ranged Armaments provide the flexibility to engage enemies from afar, making them ideal for Gloomstalkers who prefer to maintain distance and control on the battlefield.",
        details: [
            {
                subtitle: "Range",
                text: "Ranged Armaments are effective up to 100 feet, giving Gloomstalkers the advantage of striking from a safe distance. However, these weapons cannot be used within 10 feet of the intended target, forcing the wielder to keep a moderate distance in combat."
            },
            {
                subtitle: "Ammunition-Free",
                text: "Ranged Armaments require no ammunition. Thrown weapons return automatically after each use, whether they hit or miss. Bound to the Gloomstalker, Ranged Armaments cannot be lost or destroyed through conventional means."
            },
            {
                subtitle: "Combat Focus",
                text: "Ranged Armaments excel in precision strikes, multi-targeting abilities, and battlefield control, allowing Gloomstalkers to provide support from afar, handle multiple enemies, or control enemy positioning."
            }
        ]
    },
    melee: {
        title: "Melee Armaments",
        description: "Melee Armaments are designed for close combat, bringing Gloomstalkers directly into the fray and offering resilience and devastating power at short range. Melee Armaments come in two variants: Standard Reach and Extended Reach, each with unique advantages and considerations.",
        details: [
            {
                subtitle: "Standard Reach (3-6 feet)",
                text: "Standard Reach Armaments are optimal for close-quarters combat and allow Gloomstalkers to fight in confined spaces without penalty. A Standard Reach weapon also offers the benefit of increasing a Gloomstalker's Critical Wound Threshold by 1 per Rank, allowing them to endure higher Wound amounts before reaching critical status."
            },
            {
                subtitle: "Extended Reach (8-12 feet)",
                text: "Extended Reach Armaments provide additional range for keeping distance from foes and holding them at bay, but they may impose penalties when wielded in tight quarters. Extended Reach also starts with a Wound Value of 2 instead of 1, meaning it deals higher base damage, reaching a maximum of 6 Wounds at Rank 1."
            },
            {
                subtitle: "Abilities",
                text: "Abilities like Man-eater gain enhanced effectiveness with Extended Reach, allowing for an increased range on multi-target attacks. Extended Reach Armaments work well for crowd control, while Standard Reach benefits those who seek higher damage output per hit."
            },
            {
                subtitle: "Trade-Offs",
                text: "Extended Reach weapons have a -1 Success penalty when used within 5 feet of an opponent, representing the difficulty of maneuvering in confined spaces. Standard Reach Armaments, on the other hand, are easier to wield up close but lack the increased damage and range flexibility offered by Extended Reach."
            }
        ]
    }
};

const surgeBonuses = {
    soiledHands: [
        {
            name: "Striker",
            description: "When you spend (1+) Surge Points on performing any Action that may inflict Wounds upon a target, you deal 1 Additional Wound on a Success, and you deal 2 Additional Wounds on a Resounding Success for each Surge Point spent on that action."
        },
        {
            name: "Relentless Assault",
            description: "When you land an attack on a target, you may choose to expend (2) Surge Points to immediately repeat that attack on the same target. This may be repeated multiple times assuming you have the required Surge Points to spend."
        },
        {
            name: "Siege Master",
            description: "When you spend (3+) Surge Points on performing an Action which is intended to bend, break, or destroy an object, you automatically succeed, causing 10 Wounds worth of damage to the object."
        },
        {
            name: "Phoenix",
            description: "When you reach the Maimed Condition, you may choose to expend all of your current Surge Points to heal yourself for a number of Wounds equal to the number of Surge Points spent."
        }
    ],
    mutedSibilance: [
        {
            name: "Focused Mind",
            description: "When you spend (1+) Surge Points on your Reverence Roll when activating a Memento's power, you may re-roll any 1's from the result of that Reverence Roll once, keeping the new result."
        },
        {
            name: "Truth-Seeker",
            description: "You may choose to spend 2 Surge Points when asking a question during a conversation with an NPC or fellow Gloomstalker. When you do, you will immediately know with certainty whether the answer is truthful or a lie. However, if someone is only telling a half-truth, you will not be able to determine which part of the statement is a lie."
        },
        {
            name: "Axiomatic",
            description: "If you have already spoken one of your memorized Axioms in a Whisper, you may spend 3 Surge Points to speak it again without suffering the normal penalties for using an Axiom more than once in a 24-hour period. This may only be done once per Axiom until another 48 hours have passed."
        },
        {
            name: "Surge Protector",
            description: "Any time you spend (3+) Surge Points on a Reverence Roll, and then subsequently achieve a Success on that roll, you may restore 1 of the spent Surge Points. Additionally, if you achieve a Resounding Success, you may restore 2 of the spent Surge Points."
        }
    ],
    sanguineBoot: [
        {
            name: "Nimble Escape",
            description: "You may spend 2 Surge Points to immediately remove yourself from a dangerous situation without requiring any sort of Action Roll. Some things you may be able to escape from include: traps, environmental hazards, bindings, etc. and reposition yourself at a safe distance."
        },
        {
            name: "Opportunist",
            description: "After successfully landing a hit on an enemy, you may spend 1 Surge Point to strike them again immediately. This second attack automatically hits and deals 1 Wound, regardless of your Armament's level. If this second hit defeats the enemy, you may target another nearby enemy and deal 1 Wound to them as well."
        },
        {
            name: "Fleet-Footed",
            description: "Once per day, when you spend (1+) Surge Points on any Adaptability Roll, you gain the \"Traveler's Boots\" Advantage. (Increasing your Movement by 60 ft for one Scene or Conflict). The effects of this Advantage last for a number of hours equal to the number of Surge Points spent during activation."
        },
        {
            name: "Reckless Runner",
            description: "Once per day, you may spend 2 Surge Points to dash through or intentionally trigger any Environmental Hazard without taking damage. If you activate a one-time hazard, such as a trap, you effectively disarm it without harm to yourself or your party."
        },
        {
            name: "Reflex Save",
            description: "Once per combat, when an enemy targets you with an attack or action, you may spend 3 Surge Points to immediately evade the effect. However, if you perform this maneuver while near allies, you must roll 1d4 to see if the attack hits one of them instead. On a roll of 1, 2, or 3, your allies are safe. On a roll of 4, the Augur may choose a different target, and that target receives the attack."
        }
    ],
    tranquilCountenance: [
        {
            name: "Fast-Talker",
            description: "When you use your Social Skill to make a wager, gamble, or haggle over the price of an item you are selling, you may spend 2 Surge Points. If your Social Roll is a Success, you receive double the reward or price. If the roll fails, you receive only half. On a Resounding Success, you receive triple the reward or price. However, on a Critical Failure, you will be barred from making any future sales, wagers, or financial interactions with the NPC involved."
        },
        {
            name: "Commanding Tone",
            description: "Whenever you spend at least 2 Surge Points on a Social Roll during a conversation with an NPC, you automatically succeed, causing the NPC to comply with your request or provide the information you seek. However, this ability cannot be used to make an NPC do something they find morally or physically impossible, nor can it override a refusal to do something they have already declined."
        },
        {
            name: "High Stakes Negotiator",
            description: "During a Conflict, if you have (3+) Surge Points, you may choose to expend all of them on a single Social Roll. On a Success, you convince one enemy of your choice to surrender. If the roll fails, no effect occurs. On a Resounding Success, you convince up to three enemies to surrender. However, on a Critical Failure, your Conviction is immediately reduced by 2, and you lose your next turn."
        },
        {
            name: "Subtle Manipulator",
            description: "When negotiating or discussing with three or more NPCs, you may spend 2 Surge Points and attempt a Social Roll to subtly shift their opinions. On a Success, you sway the majority to align with your perspective, even if they were initially divided. On a Failure, your input is completely ignored. On a Resounding Success, you steer the entire conversation, ensuring the outcome benefits you without appearing forceful. On a Critical Failure, the group becomes suspicious of your intentions and will no longer trust your judgment on the matter at hand."
        }
    ],
    penetratingIris: [
        {
            name: "Fast-Talker",
            description: "When you use your Social Skill to make a wager, gamble, or haggle over the price of an item you are selling, you may spend 2 Surge Points. If your Social Roll is a Success, you receive double the reward or price. If the roll fails, you receive only half. On a Resounding Success, you receive triple the reward or price. However, on a Critical Failure, you will be barred from making any future sales, wagers, or financial interactions with the NPC involved."
        },
        {
            name: "Commanding Tone",
            description: "Whenever you spend at least 2 Surge Points on a Social Roll during a conversation with an NPC, you automatically succeed, causing the NPC to comply with your request or provide the information you seek. However, this ability cannot be used to make an NPC do something they find morally or physically impossible, nor can it override a refusal to do something they have already declined."
        },
        {
            name: "High Stakes Negotiator",
            description: "During a Conflict, if you have (3+) Surge Points, you may choose to expend all of them on a single Social Roll. On a Success, you convince one enemy of your choice to surrender. If the roll fails, no effect occurs. On a Resounding Success, you convince up to three enemies to surrender. However, on a Critical Failure, your Conviction is immediately reduced by 2, and you lose your next turn."
        },
        {
            name: "Subtle Manipulator",
            description: "When negotiating or discussing with three or more NPCs, you may spend 2 Surge Points and attempt a Social Roll to subtly shift their opinions. On a Success, you sway the majority to align with your perspective, even if they were initially divided. On a Failure, your input is completely ignored. On a Resounding Success, you steer the entire conversation, ensuring the outcome benefits you without appearing forceful. On a Critical Failure, the group becomes suspicious of your intentions and will no longer trust your judgment on the matter at hand."
        }
    ]
};

function updateSurgeBonusOptions() {
    const pathSelect = document.getElementById('path');
    const surgeBonusSelect = document.getElementById('surgeBonus');
    const currentPath = pathSelect.value;
    
    surgeBonusSelect.innerHTML = '<option value="" disabled selected>Choose your Surge Bonus</option>';
    
    surgeBonuses[currentPath].forEach((bonus, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = bonus.name;
        surgeBonusSelect.appendChild(option);
    });
}

function updateSurgeBonusDescription() {
    const surgeBonusSelect = document.getElementById('surgeBonus');
    const descriptionDiv = document.getElementById('surgeBonusDescription');
    const currentPath = document.getElementById('path').value;
    
    if (surgeBonusSelect.value === "") {
        descriptionDiv.style.display = 'none';
        return;
    }
    
    const selectedBonus = surgeBonuses[currentPath][surgeBonusSelect.value];
    descriptionDiv.innerHTML = `<h3>${selectedBonus.name}</h3><p>${selectedBonus.description}</p>`;
    descriptionDiv.style.display = 'block';
}

function updatePathDescription() {
    const selectedPath = document.getElementById('path').value;
    const pathDesc = pathDescriptions[selectedPath];
    const descriptionDiv = document.getElementById('pathDescription');
    
    let html = `<h3>${pathDesc.title}</h3>`;
    html += `<h4>Major Skill: ${pathDesc.majorSkill}</h4>`;
    html += `<p>${pathDesc.description}</p>`;
    html += '<ul>';
    pathDesc.stats.forEach(stat => {
        html += `<li>${stat}</li>`;
    });
    html += '</ul>';
    
    descriptionDiv.innerHTML = html;
}

function updatePathImage() {
    const path = document.getElementById("path").value;
    const pathImage = document.getElementById("pathImage");
    const skillImage = document.getElementById("skillImage");

    if (pathImages[path]) {
        pathImage.src = pathImages[path].path;
        pathImage.style.display = "block";
        skillImage.src = pathImages[path].skill;
        skillImage.style.display = "block";
    } else {
        pathImage.src = "";
        skillImage.src = "";
        pathImage.style.display = "none";
        skillImage.style.display = "none";
    }
}
const penumbralAbilities = {
    soiledHands: [
        {
            name: "Iron-Skinned",
            description: "If you ever receive 3 or more Wounds from a single attack, you can reduce the wounds received by 1."
        },
        {
            name: "Ranger",
            description: "While your Conviction is in the positive range and you are not within a village, town or city, you gain 1 additional Action Dice that may be used continuously on any of your Penumbral Arts."
        },
        {
            name: "Blood Frenzy",
            description: "After landing a Resounding Success on an Action which would deal enough Wounds to kill an enemy, you enter a frenzy for the remainder of the Conflict. In this state, you may choose to take two separate actions which would inflict Wounds instead of one, on each of your turns. However you must reduce your Conviction by 1 for each turn spent in this frenzy until your Conviction reaches -3, at that point you become exhausted and can no longer act until resting."
        },
        {
            name: "Devastator",
            description: "Once per Conflict, you can deal your Armament Wound Value multiplied by two (X2) if you successfully land a hit on an enemy, this multiplier increases to times three (X3) on a Resounding Success (This includes any additional Wound bonuses you receive upon achieving a Resounding Success.)"
        },
        {
            name: "Bloodlust",
            description: "If you enter a Conflict, with four (4) or more Combatants, you immediately gain 1 Gloomtide Surge Point (up to your Surge Point limit)."
        },
        {
            name: "Fearsome Aspect",
            description: "If you or a party member are the ones to initiate a Conflict, you may immediately attempt to use your Social Penumbral Art to intimidate one of the opponents. On a Success, select 1 enemy, that enemy will now permanently deal 1 less Wound when successfully landing a hit on you for the rest of the Scene. On a Resounding Success, this effect applies to all enemies for the remainder of the Conflict."
        },
        {
            name: "War Cry",
            description: "Once per Conflict you may let out a vicious and empowering shout. When you do this, all Allies, including yourself immediately heal for one (1) Wound, and their Conviction also increases by one (1)."
        }
    ],
    mutedSibilance: [
        {
            name: "Surreptitious Speaker",
            description: "When attempting to perform Whisperweaving while in earshot of 6 or more living beings who are capable of comprehending speech, you can roll 1 additional Action Dice on your Reverence Roll."
        },
        {
            name: "Combat Attuned",
            description: "When attempting to use a Memento during a Conflict, you can roll 1 additional Action Dice on your Reverence Roll."
        },
        {
            name: "Scholar",
            description: "You are knowledgeable of every written language which is, or has been present on Pyresh and are not required to perform actions involving reading and writing. Additionally, you are able to decipher most cryptographic languages too. (This of course does not apply to Axioms.)"
        },
        {
            name: "Blood Echo",
            description: "You may choose to inflict 4 Wounds upon yourself when performing an act of Whisperweaving. When you do this, you automatically succeed on your Reverence Roll and can immediately begin speaking your Axioms. There is no way to achieve a Resounding Success on a Whisper in this manner, however, you may use this ability to circumvent the Reverence Penalties associated with reusing Axioms. (The normal 24-hour cooldown will then be applied to the twice-used Axioms after activating them in this way.)"
        },
        {
            name: "Wayfinder",
            description: "Once per day when you are traveling in the Wilderness, you may make a Reverence Roll to listen to the Whispers of Power in an attempt to find your way. On a Failure, you gain no information. On a Success, you know the general direction you are supposed to be heading to reach your destination. On a Resounding Success, you know the exact direction and distance of your destination. On a Critical Failure, your connection to the Whispers are temporarily muted, you may not attempt this ability again for 1 full week."
        },
        {
            name: "Greater Bargainer",
            description: "When you take enough wounds to reach your Critical Wound Threshold and enter a \"Fight for Your Life Scene,\" you can choose to exchange all XP earned at your current Rank as a Bargain instead of giving up full Ranks. This only may be used 3 times."
        }
    ],
    sanguineBoot: [
        {
            name: "Distracting Presence",
            description: "Once per Conflict, you may shout obscenities at nearby enemies, attempting to draw their attention. Roll Adaptability. On a Success, you can choose one enemy whose focus shifts entirely onto you, even if there's a greater threat nearby. On a Failure, their attention remains unchanged. On a Resounding Success, you can choose up to three enemies to shift their focus to you. However, on a Critical Failure, your attempt backfires—enemies become enraged, and you suffer 2 additional Wounds from the next attack which is landed on you."
        },
        {
            name: "Gloomstride",
            description: "Once per day, you can attempt a short-distance teleportation. Choose an unoccupied, solid space within your line of sight and make an Adaptability Roll. On a Success, you teleport to the chosen area. On a Failure, you remain in your current location. On a Resounding Success, you teleport as intended, and your Gloomstride Ability automatically recharges, allowing you to use it again before the usual 24-hour cooldown. This recharge can happen endlessly in this way. However, if you roll a Critical Failure, you will teleport to a random location chosen by the Augur, take 2 Wounds, and cannot attempt another Gloomstride for 48 hours instead of the standard 24."
        },
        {
            name: "Sticky Fingers",
            description: "When performing acts of subterfuge, such as thievery, lock picking, or pickpocketing, you may add two additional Action Dice to your Adaptability Roll. Furthermore, you instinctively sense the most valuable item available for pilfering in your vicinity."
        },
        {
            name: "Feint",
            description: "During a Conflict, you may choose to feign an attack against an enemy. To do so, make an Adaptability Roll as an action. On a Success, you do not deal any damage, but instead cause the enemy to become confused. While in this state of temporary confusion, the next attack you or an ally lands on the enemy will deal double its normal damage. On a Failure, there is no effect. On a Resounding Success, the next attack that lands on the enemy will deal triple damage. Conversely, on a Critical Failure, the enemy sees through your trick and immediately retaliates with an unavoidable attack."
        },
        {
            name: "Spaghetti Step",
            description: "Once per Conflict, you can deftly maneuver behind a foe of your choice to inflict a critical strike. This Ability automatically hits, cannot be avoided, and deals damage equal to your Armament Wound Value multiplied by two (X2). Additionally, you may still roll the Action Dice, and on a Resounding Success, this bonus increases to times three (X3)."
        },
        {
            name: "Expert Trapper",
            description: "You may disarm any simple mechanical trap without requiring a roll. Additionally, you are always able to salvage something of value from traps which have been successfully disarmed."
        },
        {
            name: "Mimicry",
            description: "You have the uncanny ability to mimic any voice you have heard previously, as long as you have heard the voice of the person you are mimicking for more than 10 minutes."
        }
    ],
    tranquilCountenance: [
        {
            name: "Friendly Face",
            description: "Upon entering a City, Town, or Village you have not previously been to, and initiating a conversation with an NPC for the first time, you gain 2 additional Action Dice which you may use on any Social Roll involving that NPC. This bonus can only be applied once per newly encountered Village, Town, or City."
        },
        {
            name: "Commander",
            description: "Once per Conflict you may grant all of your allies 1 additional Action Dice which they may use on any Warfare Roll. This effect lasts through the entire encounter, however, the Gloomstalker must announce they are adding their additional Action Dice to their Warfare Roll before making the roll."
        },
        {
            name: "Briber",
            description: "You may offer some of your Wealth to an NPC for a particularly strong Advantage in practically any future Social interaction with them. For every 50 Units of Wealth you give up, you may add 1 additional Action Dice which may be used on any Social Roll involving the NPC you gave the Wealth to. This effect is permanent, meaning you may add those additional Dice to every future Social Roll involving that NPC."
        },
        {
            name: "Shared Struggles",
            description: "Whenever your Wealth is at 0 and you interact with an NPC who appears similarly impoverished, their opinion becomes more favorable. This grants you 2 additional Action Dice on any Social Roll when dealing with that NPC. Additionally, you may ask for minor favors or assistance without requiring a Social Roll. However, their opinion returns to normal once your Wealth rises above 0."
        },
        {
            name: "Diplomatic Immunity",
            description: "Once per week you may weasel you and your party members out of a situation where tensions could escalate into conflict, by making a Social Roll to avoid consequences or blame. If successful, you gain temporary immunity from any repercussions of the situation giving you time to escape. On a Failure the scene would proceed as normal. On a Resounding Success, you successfully shift the blame onto another party. On a Critical Failure, you and your party will experience more severe consequences. (Up to the Augur's discretion.)"
        },
        {
            name: "Unbreakable Will",
            description: "You cannot reach -3 Conviction; instead, -2 Conviction is the maximum negative Conviction you can attain."
        },
        {
            name: "Auctioneer",
            description: "Once per day when you are haggling, bartering, or striking a deal with an NPC, you may attempt Social Roll twice keeping the more favorable result."
        }
    ],
    penetratingIris: [
        {
            name: "Leading Charge",
            description: "Any time you are the one to initiate a Conflict, you and your party will all deal 1 additional Wound on their first attack."
        },
        {
            name: "Probe",
            description: "Once per day, and after witnessing one of your allies deal any amount of Wounds to a foe, you may immediately make an Observation Roll. On a Success, you spot a specific weakness, and inform your allies. All of their attacks against that foe now do 1 additional Wound until the end of the Conflict. This bonus increases to 2 on a Resounding Success."
        },
        {
            name: "Shared Gloom",
            description: "Once per day, you may freely choose to spend up to three of your Surge Charges. When you do this, choose a number of allies equal to the number of Surges expended. The Allies chosen each regain 1 Surge Charge. (Gloomstalkers still cannot surpass the maximum of 5 Surge Charges, even with this method.)"
        },
        {
            name: "Tactical View",
            description: "Once per Conflict, you may take a free action in the form of Observation Roll to discern the motivations or hidden strategies of a chosen NPC or enemy. On a Success, you gain insight into their next move, causing it to utterly fail. On a Resounding Success, you instead disrupt their plans completely by forcing them to forego their next turn, and allow one of your allies to immediately perform a counterattack that deals their Armament Wound Value."
        },
        {
            name: "Coordinated Defenses",
            description: "Once per Conflict, you may make a Observation Roll, and on a Success, you can choose one ally, they will now be immune to the next attack which would deal Wounds to them. On a Resounding Success, you may choose up to 3 allies instead."
        },
        {
            name: "Perceptive",
            description: "As long as you are moving at a slow and careful pace, you no longer need to make an Observation Roll to spot any basic hidden trap, door, or other suspicious things, however, this does require you to be traveling at the \"front\" of the party to be active."
        },
        {
            name: "Coordinated Retreat",
            description: "Once per day, you may safely lead your party from a Conflict. If any of your allies are currently Unconscious or Fighting for Their Life when you attempt this ability, you must make an Observation Roll. On a Success or a Failure, you may choose to proceed with the retreat, leaving those allies in danger behind, or forgo using this Ability while still spending its daily charge. However, if you achieve a Resounding Success, you can safely extract all of your allies, including those in danger. Conversely, on a Critical Failure, you must follow through with the retreat, leaving any allies still in danger to face almost certain death."
        }
    ]
};

function updatePathAbilityOptions() {
    const pathSelect = document.getElementById('path');
    const ability1Select = document.getElementById('pathAbility1');
    const ability2Select = document.getElementById('pathAbility2');
    const secondAbilityContainer = document.getElementById('secondAbilityContainer');
    const currentPath = pathSelect.value;

    ability1Select.innerHTML = '<option value="" disabled selected>Choose your first ability</option>';
    ability2Select.innerHTML = '<option value="" disabled selected>Choose your second ability</option>';

    penumbralAbilities[currentPath].forEach((ability, index) => {
        const option1 = document.createElement('option');
        option1.value = index;
        option1.textContent = ability.name;
        ability1Select.appendChild(option1);

        const option2 = document.createElement('option');
        option2.value = index;
        option2.textContent = ability.name;
        ability2Select.appendChild(option2);
    });

    if (currentPath === 'mutedSibilance') {
        secondAbilityContainer.style.display = 'none';
        ability2Select.removeAttribute('required');
    } else {
        secondAbilityContainer.style.display = 'block';
        ability2Select.setAttribute('required', 'required');
    }
}

function updatePathAbilityDescription(abilitySelect, descriptionDiv) {
    const currentPath = document.getElementById('path').value;
    
    if (abilitySelect.value === "") {
        descriptionDiv.style.display = 'none';
        return;
    }
    
    const selectedAbility = penumbralAbilities[currentPath][abilitySelect.value];
    descriptionDiv.innerHTML = `<h4>${selectedAbility.name}</h4><p>${selectedAbility.description}</p>`;
    descriptionDiv.style.display = 'block';
}

document.getElementById('pathAbility1').addEventListener('change', () => {
    updatePathAbilityDescription(
        document.getElementById('pathAbility1'),
        document.getElementById('pathAbility1Description')
    );
});

document.getElementById('pathAbility2').addEventListener('change', () => {
    updatePathAbilityDescription(
        document.getElementById('pathAbility2'),
        document.getElementById('pathAbility2Description')
    );
});

function openFullscreen(image) {
    const fullscreenDiv = document.createElement('div');
    fullscreenDiv.className = 'fullscreen';
    
    const fullscreenImg = document.createElement('img');
    fullscreenImg.src = image.src;
    
    fullscreenDiv.appendChild(fullscreenImg);
    document.body.appendChild(fullscreenDiv);
    
    fullscreenDiv.onclick = function() {
        document.body.removeChild(fullscreenDiv);
    }
}

function updateNarrativePrompt() {
    const raisonSelect = document.getElementById("raisonSelect");
    const narrativePrompt = document.getElementById("narrativePrompt");

    const prompts = {
        defender: "What was the pivotal moment that made you realize your duty to protect others?",
        seeker: "What was your most profound revelation about the Gloom during your early years?",
        harmonizer: "How did your peers react when they first noticed your lack of Hue?",
        avenger: "Describe a significant encounter where you challenged misconceptions.",
        survivor: "What was the life-altering event that led you to become a Gloomstalker?",
        champion: "How do you perceive the balance between the Gloom and the rest of Pyresh?"
    };

    narrativePrompt.placeholder = prompts[raisonSelect.value] || "Your selected narrative prompt will appear here. Please answer the prompt here.";
}

function updateSkills() {
    const selectedPath = document.getElementById('path').value;
    const majorSkillInput = document.getElementById('majorSkill');
    const minorSkillSelect = document.getElementById('minorSkill');
    
    majorSkillInput.value = pathSkills[selectedPath].major;
    
    minorSkillSelect.innerHTML = '<option value="" disabled selected>Choose a minor skill</option>';
    pathSkills[selectedPath].minorOptions.forEach(skill => {
        minorSkillSelect.innerHTML += `<option value="${skill.toLowerCase()}">${skill}</option>`;
    });
}

document.getElementById('path').addEventListener('change', updateSkills);

function updateAbilityDescription() {
    const type = document.getElementById('armamentType').value;
    const selectedAbility = document.getElementById('armamentAbility').value;
    const descriptionDiv = document.getElementById('armamentAbilityDescription');
    
    if (selectedAbility) {
        const ability = armamentAbilities[type][selectedAbility];
        let html = '';
        html += `<h3>${ability.name}</h3>`;
        html += `<p>${ability.description}</p>`;
        if (ability.progression) {
            html += `<p><strong>Progression:</strong> ${ability.progression}</p>`;
        }
        if (ability.limit) {
            html += `<p><strong>Limit:</strong> ${ability.limit}</p>`;
        }
        descriptionDiv.innerHTML = html;
    }
}

document.getElementById('armamentAbility').addEventListener('change', updateAbilityDescription);


function updateAbilities(type) {
    const abilitySelect = document.getElementById('armamentAbility');
    abilitySelect.innerHTML = '<option value="" disabled selected>Select an Ability</option>';
    
    Object.entries(armamentAbilities[type]).forEach(([key, ability]) => {
        abilitySelect.innerHTML += `<option value="${key}">${ability.name}</option>`;
    });
}

document.getElementById('armamentAbility').addEventListener('change', updateAbilityDescription);

function updateArmamentTypeDescription(type) {
    const descriptionDiv = document.getElementById('armamentTypeDescription');
    if (!type || !armamentTypeDescriptions[type]) {
        descriptionDiv.style.display = 'none';
        return;
    }

    const typeInfo = armamentTypeDescriptions[type];
    let html = `<h3>${typeInfo.title}</h3>`;
    html += `<p>${typeInfo.description}</p>`;
    
    typeInfo.details.forEach(detail => {
        html += `<h4>${detail.subtitle}</h4>`;
        html += `<p>${detail.text}</p>`;
    });

    descriptionDiv.innerHTML = html;
    descriptionDiv.style.display = 'block';
}


function exportCharacter() {
    const characterData = {
        name: document.getElementById('name').value,
        age: document.getElementById('age').value,
        rank: document.getElementById('rank').value,
        path: document.getElementById('path').value,
        raison: document.getElementById('raison').value,
        attachments: document.getElementById('attachments').value,
        wish: document.getElementById('wish').value,
        minorSkill: document.getElementById('minorSkill').value
    };
    document.getElementById('exportArea').value = JSON.stringify(characterData, null, 2);
}

function importCharacter() {
    const fileInput = document.getElementById('importFile');
    fileInput.click();
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            const data = JSON.parse(reader.result);
            document.getElementById('name').value = data.name || '';
            document.getElementById('age').value = data.age || '';
            document.getElementById('rank').value = data.rank || '';
            document.getElementById('path').value = data.path || '';
            document.getElementById('raison').value = data.raison || '';
            document.getElementById('attachments').value = data.attachments || '';
            document.getElementById('wish').value = data.wish || '';
            document.getElementById('minorSkill').value = data.minorSkill || '';
        };
        reader.readAsText(file);
    });
}

function openFullscreen(image) {
    const fullscreenDiv = document.createElement('div');
    fullscreenDiv.className = 'fullscreen';
    
    const fullscreenImg = document.createElement('img');
    fullscreenImg.src = image.src;
    
    fullscreenDiv.appendChild(fullscreenImg);
    document.body.appendChild(fullscreenDiv);
    
    fullscreenDiv.onclick = function() {
        document.body.removeChild(fullscreenDiv);
    }
}

function updateNarrativePrompt() {
    const raisonSelect = document.getElementById("raisonSelect");
    const narrativePrompt = document.getElementById("narrativePrompt");

    const prompts = {
        defender: "What was the pivotal moment that made you realize your duty to protect others?",
        seeker: "What was your most profound revelation about the Gloom during your early years?",
        harmonizer: "How did your peers react when they first noticed your lack of Hue?",
        avenger: "Describe a significant encounter where you challenged misconceptions.",
        survivor: "What was the life-altering event that led you to become a Gloomstalker?",
        champion: "How do you perceive the balance between the Gloom and the rest of Pyresh?"
    };

    narrativePrompt.placeholder = prompts[raisonSelect.value] || "Your selected narrative prompt will appear here. Please answer the prompt here.";
}

function updateSkills() {
    const selectedPath = document.getElementById('path').value;
    const majorSkillInput = document.getElementById('majorSkill');
    const minorSkillSelect = document.getElementById('minorSkill');
    
    majorSkillInput.value = pathSkills[selectedPath].major;
    
    minorSkillSelect.innerHTML = '<option value="" disabled selected>Choose a minor skill</option>';
    pathSkills[selectedPath].minorOptions.forEach(skill => {
        minorSkillSelect.innerHTML += `<option value="${skill.toLowerCase()}">${skill}</option>`;
    });
}

document.getElementById('path').addEventListener('change', updateSkills);

function updateArmamentInfo() {
    const armamentType = document.getElementById('armamentType').value;
    const armamentDescription = document.getElementById('armamentDescription');
    const abilitiesSection = document.getElementById('abilitiesSection');
    
    if (armamentType) {
        if (abilitiesSection) {
            abilitiesSection.style.display = 'block';
        }
        
        updateArmamentAbilities(armamentType);
        
        if (armamentDescription) {
            armamentDescription.style.display = 'block';
        }
    }
}

function updateArmamentAbilities(type) {
    const abilitySelect = document.getElementById('armamentAbility');
    if (abilitySelect) {
        abilitySelect.innerHTML = '<option value="" disabled selected>Select an Ability</option>';
        
        Object.entries(armamentAbilities[type]).forEach(([key, ability]) => {
            abilitySelect.innerHTML += `<option value="${key}">${ability.name}</option>`;
        });
    }
}

function updateArmamentAbilityDescription() {
    const type = document.getElementById('armamentType').value;
    const selectedAbility = document.getElementById('armamentAbility').value;
    const descriptionDiv = document.getElementById('armamentAbilityDescription');
    
    if (selectedAbility && descriptionDiv) {
        const ability = armamentAbilities[type][selectedAbility];
        let description = `<h3>${ability.name}</h3>`;
        description += `<p>${ability.description}</p>`;
        if (ability.progression) {
            description += `<p><strong>Progression:</strong> ${ability.progression}</p>`;
        }
        if (ability.limit) {
            description += `<p><strong>Limit:</strong> ${ability.limit}</p>`;
        }
        descriptionDiv.innerHTML = description;
    }
}

document.getElementById('armamentAbility').addEventListener('change', updateAbilityDescription);

function updateShroudInfo() {
    const shroudType = document.getElementById('shroudType').value;
    const statsDiv = document.getElementById('shroudStats');
    const abilitiesSection = document.getElementById('shroudAbilitiesSection');
    
    if (shroudType) {
        const movementStat = document.getElementById('movementStat');
        const cwtStat = document.getElementById('cwtStat');
        
        movementStat.textContent = `Movement: ${shroudTypes[shroudType].movement}`;
        cwtStat.textContent = `Critical Wound Threshold Bonus: ${shroudTypes[shroudType].cwt}`;
        
        statsDiv.style.display = 'block';
        abilitiesSection.style.display = 'block';
        
        updateShroudAbilities(shroudType);
    }
}

function updateShroudAbilities(type) {
    const abilitySelect = document.getElementById('shroudAbility');
    abilitySelect.innerHTML = '<option value="" disabled selected>Select an Ability</option>';
    
    Object.entries(shroudTypes[type].abilities).forEach(([key, ability]) => {
        abilitySelect.innerHTML += `<option value="${key}">${ability.name}</option>`;
    });
}

function updateShroudAbilityDescription() {
    const type = document.getElementById('shroudType').value;
    const selectedAbility = document.getElementById('shroudAbility').value;
    const descriptionDiv = document.getElementById('shroudAbilityDescription');
    
    if (selectedAbility) {
        const ability = shroudTypes[type].abilities[selectedAbility];
        let description = `<h3>${ability.name}</h3>`;
        description += `<p>${ability.description}</p>`;
        description += `<p><strong>Progression:</strong> ${ability.progression}</p>`;
        descriptionDiv.innerHTML = description;
    }
}

function exportCharacter() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let yPos = 20;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const lineHeight = 7;

    const characterData = {
        // Basic Info
        name: document.getElementById('name').value,
        age: document.getElementById('age').value,
        rank: document.getElementById('rank').value,
        
        // Path & Skills
        path: document.getElementById('path').value,
        majorSkill: document.getElementById('majorSkill').value,
        minorSkill: document.getElementById('minorSkill').value,
        
        // Abilities
        surgeBonus: document.getElementById('surgeBonus').value,
        pathAbility1: document.getElementById('pathAbility1').value,
        pathAbility2: document.getElementById('pathAbility2').value,
        
        // Armament
        armamentType: document.getElementById('armamentType').value,
        armamentAbility: document.getElementById('armamentAbility').value,
        armamentDescription: document.getElementById('armamentDescription').value,
        
        // Shroud
        shroudType: document.getElementById('shroudType').value,
        shroudAbility: document.getElementById('shroudAbility').value,
        shroudDescription: document.getElementById('shroudDescription').value,
        
        // Narrative Elements
        raison: document.getElementById('raisonSelect').value,
        raisonStory: document.getElementById('narrativePrompt').value,
        individual: document.getElementById('individual').value,
        individualStory: document.getElementById('secondTextarea').value,
        location: document.getElementById('location').value,
        locationStory: document.getElementById('locationTextarea').value,
        ideal: document.getElementById('ideal').value,
        idealStory: document.getElementById('idealsTextarea').value,
        wish: document.getElementById('wish').value
    };

    function addSection(title, content) {
        if (yPos > pageHeight - 50) {
            doc.addPage();
            yPos = margin;
        }

        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text(title, margin, yPos);
        yPos += lineHeight * 2;

        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        
        const lines = doc.splitTextToSize(content, doc.internal.pageSize.width - 40);
        lines.forEach(line => {
            if (yPos > pageHeight - margin) {
                doc.addPage();
                yPos = margin;
            }
            doc.text(line, margin, yPos);
            yPos += lineHeight;
        });

        yPos += lineHeight * 2;
    }

    doc.setFontSize(20);
    doc.text('Character Sheet', margin, yPos);
    
    yPos += lineHeight * 1.5;
    doc.setFontSize(14);
    doc.setFont(undefined, 'italic');
    doc.text('Acta Non Verba', margin, yPos);
    
    yPos += lineHeight * 3;


    addSection('Basic Information', 
        `Name: ${characterData.name}\nAge: ${characterData.age}\nRank: ${characterData.rank}`);
    
    addSection('Solemn Burdens',
        `Raison d'être: ${characterData.raison}\nStory:\n${characterData.raisonStory}`);
    
    addSection('Attachments',
        `Individual: ${characterData.individual}\nIndividual Story:\n${characterData.individualStory}\n\n` +
        `Location: ${characterData.location}\nLocation Story:\n${characterData.locationStory}\n\n` +
        `Ideal: ${characterData.ideal}\nIdeal Story:\n${characterData.idealStory}`);
    
    addSection('Path & Abilities',
        `Path: ${characterData.path}\n` +
        `Major Skill: ${characterData.majorSkill}\n` +
        `Minor Skill: ${characterData.minorSkill}\n` +
        `Surge Bonus: ${characterData.surgeBonus}\n` +
        `Path Ability 1: ${characterData.pathAbility1}\n` +
        `Path Ability 2: ${characterData.pathAbility2}`);
    
    addSection('Armament',
        `Type: ${characterData.armamentType}\n` +
        `Ability: ${characterData.armamentAbility}\n\n` +
        `Description:\n${characterData.armamentDescription}`);
    
    addSection('Shroud',
        `Type: ${characterData.shroudType}\n` +
        `Ability: ${characterData.shroudAbility}\n\n` +
        `Description:\n${characterData.shroudDescription}`);

    // Save the PDF with the character's name
    doc.save(`${characterData.name}_character_sheet.pdf`);
}




function importCharacter() {
    const fileInput = document.getElementById('importFile');
    fileInput.click();
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            const data = JSON.parse(reader.result);
            document.getElementById('name').value = data.name || '';
            document.getElementById('age').value = data.age || '';
            document.getElementById('rank').value = data.rank || '';
            document.getElementById('path').value = data.path || '';
            document.getElementById('raison').value = data.raison || '';
            document.getElementById('attachments').value = data.attachments || '';
            document.getElementById('wish').value = data.wish || '';
            document.getElementById('minorSkill').value = data.minorSkill || '';
        };
        reader.readAsText(file);
    });
}

function validateElements(elements) {
    return Object.values(elements).every(element => element !== null);
}

function initializePath() {
    const pathSelect = document.getElementById('path');
    if (pathSelect) {
        pathSelect.value = 'soiledHands';
        const pathImage = document.getElementById('pathImage');
        const skillImage = document.getElementById('skillImage');
        
        if (pathImage) pathImage.src = pathImages.soiledHands.path;
        if (skillImage) skillImage.src = pathImages.soiledHands.skill;
        
        updatePathDescription();
        updatePathImage();
        updateSkills();
    }
}

function setupEventListeners(elements) {

    elements.characterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Character Saved!');
    });

    elements.pathSelect.addEventListener('change', () => {
        updatePathImage();
        updateSkills();
        updatePathDescription();
        updateSurgeBonusOptions();
        updatePathAbilityOptions();
    });

    elements.shroudType.addEventListener('change', () => {
        elements.shroudStats.style.display = 'block';
        elements.shroudAbilitiesSection.style.display = 'block';
        updateShroudInfo();
    });
    
    elements.shroudAbility.addEventListener('change', updateShroudAbilityDescription);

    elements.armamentType.addEventListener('change', () => {
        updateArmamentInfo();
        updateArmamentTypeDescription(elements.armamentType.value);
    });
    
    elements.armamentAbility.addEventListener('change', updateArmamentAbilityDescription);

    elements.surgeBonus.addEventListener('change', updateSurgeBonusDescription);
}

document.addEventListener('DOMContentLoaded', function() {
    const elements = {
        characterForm: document.getElementById('characterForm'),
        pathSelect: document.getElementById('path'),
        shroudType: document.getElementById('shroudType'),
        shroudAbility: document.getElementById('shroudAbility'),
        shroudStats: document.getElementById('shroudStats'),
        shroudAbilitiesSection: document.getElementById('shroudAbilitiesSection'),
        armamentType: document.getElementById('armamentType'),
        armamentAbility: document.getElementById('armamentAbility'),
        abilitiesSection: document.getElementById('abilitiesSection'),
        surgeBonus: document.getElementById('surgeBonus')
    };

    initializePath();
    
    if (Object.values(elements).every(element => element !== null)) {
        setupEventListeners(elements);
    }
});
