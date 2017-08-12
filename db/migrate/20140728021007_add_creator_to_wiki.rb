class AddCreatorToWiki < ActiveRecord::Migration[4.2]
  def change
    add_column :wikis, :creator_id, :integer
  end
end
