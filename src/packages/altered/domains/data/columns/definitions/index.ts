// /**
//  *
//  */

// import { DataConstraint, DataConstraintID } from "../../constraints"
// import { DataRule } from "./rule"
// import { DataType } from "./type"

// export type DataColumn = {
//     id: string
//     name: string
//     description: string
//     default: string | null

//     type: DataType
//     required: boolean
//     constraints: DataConstraintID[]
// }

// export type SerializableDataColumn = Omit<DataColumn, "type"> & {
//     type: DataType["id"]
// }
