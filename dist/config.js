/*
 * RoboEyes for the web: the face's settings and their defaults.
 *
 * Port and mouth: Copyright (C) 2026 X Tech Laboratories
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */
import defaultConfigJson from './defaultConfig.js';
/** The face's settings and states as they come, kept in defaultConfig.json. */
export const defaultConfig = defaultConfigJson;
/** A deep copy of config with patch laid over it. */
export function mergeConfig(config, patch) {
    return merge(structuredClone(config), patch);
}
function merge(target, patch) {
    for (const [key, value] of Object.entries(patch ?? {})) {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            target[key] = merge(target[key] && typeof target[key] === 'object' ? target[key] : {}, value);
        }
        else if (value !== undefined) {
            target[key] = value;
        }
    }
    return target;
}
