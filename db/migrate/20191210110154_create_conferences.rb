class CreateConferences < ActiveRecord::Migration[6.0]
  def change
    create_table :conferences do |t|
      t.string :name
      t.string :city
      t.string :url
      t.date :date_start
      t.date :date_end

      t.timestamps
    end
  end
end
