import gql from "graphql-tag";

export const SAVE_ECONOMY = gql`
   mutation SaveEconomy($data: SaveEconomyInput) {
      saveEconomy(data: $data) {
         id
         extract {
            date
            value
         }
      }
   }
`
