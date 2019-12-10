class ConferencesController < ApiController
  def get
    render json: Conference.all.as_json, status: 200
  end
end
